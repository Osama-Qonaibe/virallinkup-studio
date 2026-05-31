import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './Editor.css';

const LANG_MAP = { js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', css: 'css', html: 'html', json: 'json', md: 'markdown', py: 'python', sh: 'shell' };

export default function Editor({ project, file, onChange }) {
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (project && file) loadFile();
    else setContent('');
  }, [project, file]);

  async function loadFile() {
    const res = await fetch(`/api/files/${project.name}/read?path=${encodeURIComponent(file.path)}`);
    const data = await res.json();
    setContent(data.content || '');
    setIsDirty(false);
  }

  function handleChange(value) {
    setContent(value);
    setIsDirty(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(value), 1000);
  }

  async function autoSave(value) {
    if (!project || !file) return;
    setSaving(true);
    await fetch(`/api/files/${project.name}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: file.path, content: value })
    });
    setSaving(false);
    setIsDirty(false);
    if (onChange) onChange();
  }

  const ext = file?.name?.split('.').pop() || 'txt';
  const language = LANG_MAP[ext] || 'plaintext';

  return (
    <div className="editor-panel">
      <div className="editor-tab">
        {file ? (
          <><span className="tab-name">{file.name}</span>{isDirty && <span className="tab-dot">●</span>}{saving && <span className="tab-saving">saving...</span>}</>
        ) : (
          <span className="tab-empty">No file selected</span>
        )}
      </div>
      {file ? (
        <MonacoEditor
          height="100%"
          language={language}
          value={content}
          theme="vs-dark"
          onChange={handleChange}
          options={{ fontSize: 13, fontFamily: 'JetBrains Mono, Fira Code, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbers: 'on', renderLineHighlight: 'line', smoothScrolling: true, cursorBlinking: 'smooth' }}
        />
      ) : (
        <div className="editor-empty">Select a file to edit</div>
      )}
    </div>
  );
}
