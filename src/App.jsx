import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Scratchpad from './components/Scratchpad';
import StatusBar from './components/StatusBar';
import RightActionToolbar from './components/RightActionToolbar';
import SettingsModal from './components/SettingsModal';
import { useUndoableState } from './hooks/useUndoableState';
import { CheckCircle2 } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'inmem_memo_user_settings';

const DEFAULT_SETTINGS = {
  shortcut: 'Ctrl+Shift+M',
  theme: 'midnight',
  fontSize: '15px',
  tabSize: 2,
  wordWrap: true,
  customActions: [
    {
      id: 'clean-empty-lines',
      name: '空行削除',
      pattern: '^\\s*$\\n',
      replacement: '',
      flags: 'gm',
      type: 'regex'
    },
    {
      id: 'comma-to-newlines',
      name: 'カンマを改行に',
      pattern: ',\\s*',
      replacement: '\\n',
      flags: 'g',
      type: 'regex'
    }
  ]
};

// Built-in JSON Format Action
const BUILTIN_JSON_ACTION = {
  id: 'json-format',
  name: 'JSON整形',
  description: 'JSON文字列をインデント(2スペース)で美しく自動整形',
  type: 'builtin'
};

export default function App() {
  // Pure In-Memory State with Undo/Redo support
  const { 
    text, 
    setText, 
    setTextImmediate, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useUndoableState('');

  const [isPreview, setIsPreview] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState('shortcuts');
  const [toastMessage, setToastMessage] = useState('');

  // Persistent user settings (localStorage)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Prompt before unload if there's unsaved memory text
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (text.trim()) {
        e.preventDefault();
        e.returnValue = 'メモはメモリ上にしか保存されていません。終了すると消去されますがよろしいですか？';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [text]);

  // Apply theme & font size to DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.style.setProperty('--editor-font-size', settings.fontSize);
  }, [settings]);

  // Sync initial/updated shortcut with Tauri backend
  useEffect(() => {
    const syncShortcut = async () => {
      try {
        if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
          const { invoke } = await import('@tauri-apps/api/core');
          await invoke('update_global_shortcut', { shortcutStr: settings.shortcut });
        }
      } catch (err) {
        console.warn('Tauri shortcut sync notice:', err);
      }
    };
    syncShortcut();
  }, [settings.shortcut]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Keyboard shortcut listener for Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleUndoRedoShortcuts = (e) => {
      if (isSettingsOpen) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && !e.altKey) {
        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z')) {
          e.preventDefault();
          if (redo()) {
            showToast('やり直しました (Redo)');
          }
        }
        // Undo: Ctrl+Z
        else if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (undo()) {
            showToast('元に戻しました (Undo)');
          }
        }
      }
    };

    window.addEventListener('keydown', handleUndoRedoShortcuts);
    return () => window.removeEventListener('keydown', handleUndoRedoShortcuts);
  }, [undo, redo, isSettingsOpen]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('クリップボードにコピーしました');
    } catch (err) {
      showToast('コピーに失敗しました');
    }
  };

  const handleClear = () => {
    if (!text) return;
    if (window.confirm('メモを消去してもよろしいですか？（メモリから即座に削除されます）')) {
      setTextImmediate('');
      showToast('メモをクリアしました (Ctrl+Zで復元可能)');
    }
  };

  const handleExport = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scratchpad-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ファイルとして保存しました');
  };

  const handleSaveSettings = async (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to persist settings:', e);
    }
  };

  // Complete Application Exit (Terminates Tray and Process)
  const handleQuitApp = async () => {
    if (window.confirm('アプリケーションを完全に終了しますか？\n（タスクトレイからも終了し、メモリ上のメモデータは完全に破棄されます）')) {
      try {
        if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
          const { invoke } = await import('@tauri-apps/api/core');
          await invoke('exit_app');
        } else {
          window.close();
        }
      } catch (err) {
        console.error('Failed to exit app:', err);
        window.close();
      }
    }
  };

  // Execute Action (JSON Format or Custom Regex Replacement) with explicit Undo checkpoint
  const handleExecuteAction = (action) => {
    if (!text) {
      showToast('テキストが入力されていません');
      return;
    }

    if (action.id === 'json-format') {
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, settings.tabSize || 2);
        setTextImmediate(formatted);
        showToast('JSONを整形しました (Ctrl+Zで戻せます)');
      } catch (err) {
        showToast(`JSON解析エラー: ${err.message}`);
      }
      return;
    }

    if (action.pattern) {
      try {
        const reg = new RegExp(action.pattern, action.flags || 'g');
        const formattedRep = (action.replacement || '').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        const count = (text.match(reg) || []).length;
        const newText = text.replace(reg, formattedRep);
        setTextImmediate(newText);
        showToast(`「${action.name}」を実行しました (${count}箇所置換 - Ctrl+Zで戻せます)`);
      } catch (err) {
        showToast(`正規表現エラー: ${err.message}`);
      }
    }
  };

  const openSettingsWithTab = (tabName = 'shortcuts') => {
    setInitialSettingsTab(tabName);
    setIsSettingsOpen(true);
  };

  // Compose all active toolbar actions: JSON Format first, followed by custom actions
  const allToolbarActions = [
    BUILTIN_JSON_ACTION,
    ...(settings.customActions || [])
  ];

  return (
    <div className="app-container">
      <Header 
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        onCopy={handleCopy}
        onClear={handleClear}
        onExport={handleExport}
        onOpenSettings={() => openSettingsWithTab('shortcuts')}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="main-workspace-layout">
        <Scratchpad 
          text={text}
          setText={setText}
          isPreview={isPreview}
          tabSize={settings.tabSize}
          wordWrap={settings.wordWrap}
        />

        <RightActionToolbar 
          actions={allToolbarActions}
          onExecuteAction={handleExecuteAction}
          onOpenSettings={openSettingsWithTab}
        />
      </div>

      <StatusBar text={text} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        showToast={showToast}
        onQuitApp={handleQuitApp}
        initialTab={initialSettingsTab}
      />

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
