import React, { useRef, useEffect } from 'react';
import { marked } from 'marked';

export default function Scratchpad({ text, setText, isPreview }) {
  const textareaRef = useRef(null);

  // Auto focus on mount
  useEffect(() => {
    if (!isPreview && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPreview]);

  // Handle Tab key in editor
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newText = text.substring(0, start) + '  ' + text.substring(end);
      setText(newText);

      // Reset cursor position after React update
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const getParsedMarkdown = () => {
    try {
      return { __html: marked.parse(text || '*No content*') };
    } catch (e) {
      return { __html: '<p style="color: var(--accent-rose)">Markdown Parse Error</p>' };
    }
  };

  return (
    <main className="editor-container">
      {!isPreview ? (
        <div className="textarea-wrapper">
          <textarea
            ref={textareaRef}
            className="scratchpad-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ここに思いついたメモやアイデアを即座に入力... (アプリを閉じると自動的に消去されます)"
            spellCheck={false}
          />
        </div>
      ) : (
        <div 
          className="markdown-preview"
          dangerouslySetInnerHTML={getParsedMarkdown()}
        />
      )}
    </main>
  );
}
