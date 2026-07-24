import React from 'react';
import { 
  Zap, 
  Copy, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  ShieldAlert 
} from 'lucide-react';

export default function Header({ 
  isPreview, 
  setIsPreview, 
  onCopy, 
  onClear, 
  onExport 
}) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-icon">
          <Zap size={16} />
        </div>
        <span className="brand-title">InMem Scratchpad</span>
        <div className="badge-inmemory" title="アプリを終了するとメモデータは自動的にメモリから破棄されます">
          <span className="badge-dot"></span>
          In-Memory Only
        </div>
      </div>

      <div className="header-actions">
        {/* Toggle Mode */}
        <button 
          className={`btn ${isPreview ? 'btn-toggle active' : 'btn'}`}
          onClick={() => setIsPreview(!isPreview)}
          title={isPreview ? "エディタに戻る" : "Markdown プレビュー"}
        >
          {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
          <span>{isPreview ? 'Edit' : 'Preview'}</span>
        </button>

        {/* Copy All */}
        <button className="btn" onClick={onCopy} title="全体をクリップボードにコピー">
          <Copy size={14} />
          <span>Copy</span>
        </button>

        {/* Export Manual File */}
        <button className="btn" onClick={onExport} title="ファイルとしてダウンロード (.md)">
          <Download size={14} />
          <span>Export</span>
        </button>

        {/* Clear Memo */}
        <button className="btn btn-danger" onClick={onClear} title="メモをクリア">
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
      </div>
    </header>
  );
}
