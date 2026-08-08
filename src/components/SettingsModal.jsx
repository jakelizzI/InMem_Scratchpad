import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Keyboard, 
  Palette, 
  FileText, 
  ShieldCheck, 
  Check, 
  RefreshCw, 
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  Edit2,
  Code2,
  Play,
  Power
} from 'lucide-react';

const PRESET_SHORTCUTS = [
  'Ctrl+Shift+M',
  'Alt+Space',
  'Ctrl+Alt+N',
  'Ctrl+Shift+K',
  'Alt+Shift+S',
  'Ctrl+Shift+Space'
];

const PRESET_REGEX_ACTIONS = [
  { name: '空行を削除', pattern: '^\\s*$\\n', replacement: '', flags: 'gm', description: '連続する空白行や空行をすべて削除' },
  { name: '行末スペース削除', pattern: '[ \\t]+$', replacement: '', flags: 'gm', description: '各行の末尾にある無駄な空白やタブを削除' },
  { name: 'カンマを改行に', pattern: ',\\s*', replacement: '\\n', flags: 'g', description: 'カンマ区切りテキストを行ごとに分割' },
  { name: 'HTMLタグ除去', pattern: '<[^>]+>', replacement: '', flags: 'g', description: 'HTMLタグをすべて取り除きプレーンテキスト化' },
  { name: '連続空白を1つに', pattern: '[ \\t]+', replacement: ' ', flags: 'g', description: '複数の連続するスペースやタブを1つの半角スペースに統一' }
];

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSaveSettings,
  showToast,
  onQuitApp,
  initialTab = 'shortcuts'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localSettings, setLocalSettings] = useState(settings);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New action form state
  const [actionName, setActionName] = useState('');
  const [actionPattern, setActionPattern] = useState('');
  const [actionReplacement, setActionReplacement] = useState('');
  const [actionFlags, setActionFlags] = useState('g');
  const [editingIndex, setEditingIndex] = useState(null);

  // Live test preview state
  const [testInput, setTestInput] = useState('Apple, Banana, Orange, Mango');
  const [testOutput, setTestOutput] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Key recorder event listener
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');
      if (e.metaKey) parts.push('Cmd');

      const key = e.key;
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        let normalizedKey = key.toUpperCase();
        if (key === ' ') normalizedKey = 'Space';
        if (key === 'Escape') normalizedKey = 'Esc';
        
        parts.push(normalizedKey);
        const combo = parts.join('+');
        setLocalSettings((prev) => ({ ...prev, shortcut: combo }));
        setIsRecording(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isRecording]);

  // Live regex test calculator
  useEffect(() => {
    if (!actionPattern) {
      setTestOutput(testInput);
      return;
    }
    try {
      const reg = new RegExp(actionPattern, actionFlags || 'g');
      const formattedRep = actionReplacement.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      setTestOutput(testInput.replace(reg, formattedRep));
    } catch (e) {
      setTestOutput(`(正規表現エラー: ${e.message})`);
    }
  }, [actionPattern, actionReplacement, actionFlags, testInput]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(localSettings);
      showToast('設定を保存・適用しました');
      onClose();
    } catch (err) {
      showToast(err?.message || '設定の保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOrUpdateAction = () => {
    if (!actionName.trim() || !actionPattern.trim()) {
      showToast('アクション名と正規表現パターンを入力してください');
      return;
    }

    try {
      new RegExp(actionPattern, actionFlags);
    } catch (e) {
      showToast(`無効な正規表現です: ${e.message}`);
      return;
    }

    const newAction = {
      id: editingIndex !== null ? localSettings.customActions[editingIndex].id : `action-${Date.now()}`,
      name: actionName.trim(),
      pattern: actionPattern,
      replacement: actionReplacement,
      flags: actionFlags || 'g',
      type: 'regex'
    };

    setLocalSettings(prev => {
      const actions = [...(prev.customActions || [])];
      if (editingIndex !== null) {
        actions[editingIndex] = newAction;
      } else {
        actions.push(newAction);
      }
      return { ...prev, customActions: actions };
    });

    setActionName('');
    setActionPattern('');
    setActionReplacement('');
    setActionFlags('g');
    setEditingIndex(null);
    showToast(editingIndex !== null ? 'アクションを更新しました' : '新しいアクションを追加しました');
  };

  const handleEditAction = (index) => {
    const act = localSettings.customActions[index];
    setActionName(act.name);
    setActionPattern(act.pattern);
    setActionReplacement(act.replacement || '');
    setActionFlags(act.flags || 'g');
    setEditingIndex(index);
  };

  const handleDeleteAction = (index) => {
    setLocalSettings(prev => ({
      ...prev,
      customActions: prev.customActions.filter((_, i) => i !== index)
    }));
    if (editingIndex === index) {
      setEditingIndex(null);
      setActionName('');
      setActionPattern('');
      setActionReplacement('');
    }
    showToast('アクションを削除しました');
  };

  const handleAddPreset = (preset) => {
    const newAction = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      pattern: preset.pattern,
      replacement: preset.replacement,
      flags: preset.flags,
      description: preset.description,
      type: 'regex'
    };
    setLocalSettings(prev => ({
      ...prev,
      customActions: [...(prev.customActions || []), newAction]
    }));
    showToast(`「${preset.name}」を追加しました`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-extended" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <div className="modal-icon-badge">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="modal-title">アプリケーション設定</h2>
              <p className="modal-subtitle">設定値はローカルに永続化保存されます</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="閉じる">
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <Keyboard size={14} />
            <span>ショートカット</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            <Wand2 size={14} />
            <span>右側アクション</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={14} />
            <span>外観・テーマ</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <FileText size={14} />
            <span>エディタ設定</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <ShieldCheck size={14} />
            <span>メモリ・終了</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* TAB: Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="tab-content">
              <div className="setting-section">
                <div className="setting-section-title">
                  <Keyboard size={15} />
                  <span>グローバル呼び出しショートカット</span>
                </div>
                <p className="setting-description">
                  他の作業中でも、このキーコンビネーションを押すことで瞬時にスクラッチパッドを表示 / 非表示にできます。
                </p>

                <div className="shortcut-input-group">
                  <div 
                    className={`shortcut-recorder-box ${isRecording ? 'recording' : ''}`}
                    onClick={() => setIsRecording(true)}
                  >
                    <div className="shortcut-key-chips">
                      {localSettings.shortcut ? (
                        localSettings.shortcut.split('+').map((key, index) => (
                          <span key={index} className="key-chip">
                            {key}
                          </span>
                        ))
                      ) : (
                        <span className="key-chip-placeholder">未設定</span>
                      )}
                    </div>
                    <button 
                      className={`btn-record ${isRecording ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRecording(!isRecording);
                      }}
                    >
                      <Sparkles size={13} />
                      <span>{isRecording ? 'キーを入力中...' : 'キーを記録'}</span>
                    </button>
                  </div>
                </div>

                <div className="presets-wrapper">
                  <span className="presets-label">おすすめプリセット:</span>
                  <div className="presets-list">
                    {PRESET_SHORTCUTS.map((preset) => (
                      <button
                        key={preset}
                        className={`preset-btn ${localSettings.shortcut === preset ? 'active' : ''}`}
                        onClick={() => {
                          setLocalSettings((prev) => ({ ...prev, shortcut: preset }));
                          setIsRecording(false);
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Quick Actions / Regex */}
          {activeTab === 'actions' && (
            <div className="tab-content actions-tab-content">
              {/* Builtin JSON Action */}
              <div className="action-card builtin-card">
                <div className="action-card-info">
                  <div className="action-badge-default">
                    <Code2 size={13} />
                    <span>デフォルト先頭固定</span>
                  </div>
                  <span className="action-card-title">JSONフォーマット (JSON整形)</span>
                  <span className="action-card-desc">エディタ内のJSON文字列をインデント(2スペース)で美しく自動整形します</span>
                </div>
              </div>

              {/* Custom Action Form */}
              <div className="custom-action-form-box">
                <div className="form-box-title">
                  <Wand2 size={14} />
                  <span>{editingIndex !== null ? '正規表現アクションの編集' : '新規正規表現アクションの追加'}</span>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>ボタン表示名</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="例: カンマを改行に"
                      value={actionName}
                      onChange={(e) => setActionName(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>フラグ (Flags)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="g, i, m"
                      value={actionFlags}
                      onChange={(e) => setActionFlags(e.target.value)}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>検索する正規表現パターン (Pattern)</label>
                    <input 
                      type="text" 
                      className="form-input code-font" 
                      placeholder="例: ,\s* または ^\s*$\n"
                      value={actionPattern}
                      onChange={(e) => setActionPattern(e.target.value)}
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>置換後の文字列 (Replacement)</label>
                    <input 
                      type="text" 
                      className="form-input code-font" 
                      placeholder="例: \n または 空白"
                      value={actionReplacement}
                      onChange={(e) => setActionReplacement(e.target.value)}
                    />
                  </div>
                </div>

                {/* Live Regex Test Box */}
                <div className="live-test-box">
                  <div className="live-test-header">
                    <Play size={11} />
                    <span>ライブ置換テスト</span>
                  </div>
                  <div className="live-test-inputs">
                    <input 
                      type="text" 
                      className="live-input" 
                      placeholder="テスト用文字列"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                    />
                    <div className="live-arrow">➔</div>
                    <input 
                      type="text" 
                      className="live-output" 
                      readOnly 
                      value={testOutput}
                    />
                  </div>
                </div>

                <div className="form-actions-row">
                  {editingIndex !== null && (
                    <button 
                      className="btn" 
                      onClick={() => {
                        setEditingIndex(null);
                        setActionName('');
                        setActionPattern('');
                        setActionReplacement('');
                      }}
                    >
                      キャンセル
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={handleAddOrUpdateAction}>
                    <Plus size={13} />
                    <span>{editingIndex !== null ? '変更を確定' : 'アクションを追加'}</span>
                  </button>
                </div>
              </div>

              {/* Registered Actions List */}
              <div className="registered-actions-section">
                <span className="section-small-title">登録済みカスタムアクション ({localSettings.customActions?.length || 0})</span>
                {localSettings.customActions && localSettings.customActions.length > 0 ? (
                  <div className="actions-card-list">
                    {localSettings.customActions.map((act, idx) => (
                      <div key={act.id || idx} className="action-card">
                        <div className="action-card-info">
                          <div className="action-card-top">
                            <span className="action-card-title">{act.name}</span>
                            <span className="action-flags-badge">/{act.flags || 'g'}</span>
                          </div>
                          <div className="action-regex-details">
                            <code>/{act.pattern}/</code> ➔ <code>"{act.replacement}"</code>
                          </div>
                        </div>
                        <div className="action-card-buttons">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEditAction(idx)}
                            title="編集"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            className="btn-icon btn-icon-danger" 
                            onClick={() => handleDeleteAction(idx)}
                            title="削除"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-actions-hint">
                    追加されたカスタムアクションはまだありません。上記のフォームまたは下のプリセットから追加してください。
                  </div>
                )}
              </div>

              {/* Presets List */}
              <div className="presets-wrapper">
                <span className="presets-label">おすすめ正規表現プリセット (クリックで追加):</span>
                <div className="presets-list">
                  {PRESET_REGEX_ACTIONS.map((preset, i) => (
                    <button
                      key={i}
                      className="preset-btn"
                      onClick={() => handleAddPreset(preset)}
                      title={preset.description}
                    >
                      <Plus size={11} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Appearance */}
          {activeTab === 'appearance' && (
            <div className="tab-content">
              <div className="setting-section">
                <div className="setting-section-title">
                  <span>カラーテーマ</span>
                </div>
                <div className="theme-options-grid">
                  <label className={`theme-card ${localSettings.theme === 'midnight' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="midnight" 
                      checked={localSettings.theme === 'midnight'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value }))}
                    />
                    <div className="theme-preview midnight"></div>
                    <div className="theme-meta">
                      <span className="theme-name">Midnight Dark</span>
                      <span className="theme-desc">標準の深いグラデーション</span>
                    </div>
                  </label>

                  <label className={`theme-card ${localSettings.theme === 'oled' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value="oled" 
                      checked={localSettings.theme === 'oled'}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value }))}
                    />
                    <div className="theme-preview oled"></div>
                    <div className="theme-meta">
                      <span className="theme-name">OLED Pure Black</span>
                      <span className="theme-desc">完全な黒で省電力</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="setting-section">
                <div className="setting-section-title">
                  <span>フォントサイズ</span>
                </div>
                <div className="segmented-control">
                  {['13px', '15px', '17px'].map((size) => (
                    <button
                      key={size}
                      className={`segment-btn ${localSettings.fontSize === size ? 'active' : ''}`}
                      onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: size }))}
                    >
                      {size === '13px' ? '小 (13px)' : size === '15px' ? '中 (標準 15px)' : '大 (17px)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Editor Settings */}
          {activeTab === 'editor' && (
            <div className="tab-content">
              <div className="setting-section">
                <div className="setting-section-title">
                  <span>Tabキーのインデント幅</span>
                </div>
                <div className="segmented-control">
                  {[2, 4].map((spaces) => (
                    <button
                      key={spaces}
                      className={`segment-btn ${localSettings.tabSize === spaces ? 'active' : ''}`}
                      onClick={() => setLocalSettings(prev => ({ ...prev, tabSize: spaces }))}
                    >
                      {spaces} スペース
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-section">
                <label className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">自動折り返し (Word Wrap)</span>
                    <span className="toggle-desc">長い行をウィンドウ幅に合わせて折り返します</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="custom-toggle"
                    checked={localSettings.wordWrap}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, wordWrap: e.target.checked }))}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB: Privacy & Application Termination */}
          {activeTab === 'privacy' && (
            <div className="tab-content">
              <div className="info-box-large">
                <div className="info-box-header">
                  <ShieldCheck size={18} />
                  <span>完全インメモリ保護ポリシー</span>
                </div>
                <p className="info-box-text">
                  ・<strong>メモ本文テキスト</strong>: ハードディスク・データベース・localStorageには一切書き込まれません。アプリを完全終了すると即座にメモリから完全消滅します。<br />
                  ・<strong>設定値・アクション定義</strong>: ショートカットキー、カスタム正規表現アクション、テーマ設定のみがローカルに保存され、次回起動時にも復元されます。
                </p>
              </div>

              {/* Complete Application Exit Section */}
              <div className="quit-app-section">
                <div className="quit-app-info">
                  <span className="quit-app-title">アプリケーションの完全終了</span>
                  <span className="quit-app-desc">
                    タスクトレイの常駐プロセスを含め、アプリを完全に終了してメモリを解放します。
                  </span>
                </div>
                <button 
                  className="btn btn-quit-app" 
                  onClick={onQuitApp}
                  title="タスクトレイを含めて完全に終了"
                >
                  <Power size={14} />
                  <span>アプリを完全終了 (Exit)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            キャンセル
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
            <span>設定を保存</span>
          </button>
        </div>
      </div>
    </div>
  );
}
