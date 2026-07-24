import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Scratchpad from './components/Scratchpad';
import StatusBar from './components/StatusBar';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Pure In-Memory State: NO localStorage, NO IndexedDB, NO disk file sync.
  const [text, setText] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2200);
  };

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
      setText('');
      showToast('メモをクリアしました');
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

  return (
    <div className="app-container">
      <Header 
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        onCopy={handleCopy}
        onClear={handleClear}
        onExport={handleExport}
      />

      <Scratchpad 
        text={text}
        setText={setText}
        isPreview={isPreview}
      />

      <StatusBar text={text} />

      {toastMessage && (
        <div className="toast-notification">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
