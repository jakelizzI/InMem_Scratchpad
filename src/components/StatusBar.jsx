import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function StatusBar({ text }) {
  const chars = text.length;
  const lines = text ? text.split('\n').length : 0;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <footer className="status-bar">
      <div className="status-metrics">
        <div className="metric-item">
          <span>Chars:</span>
          <span className="metric-value">{chars}</span>
        </div>
        <div className="metric-item">
          <span>Words:</span>
          <span className="metric-value">{words}</span>
        </div>
        <div className="metric-item">
          <span>Lines:</span>
          <span className="metric-value">{lines}</span>
        </div>
      </div>

      <div className="status-warning">
        <ShieldCheck size={13} style={{ color: 'var(--accent-emerald)' }} />
        <span>No disk persistence — Data disappears when closed</span>
      </div>
    </footer>
  );
}
