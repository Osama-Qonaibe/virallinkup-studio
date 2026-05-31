import React, { useState, useEffect } from 'react';
import './EnvEditor.css';

export default function EnvEditor({ project, onClose }) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEnv(); }, [project]);

  async function loadEnv() {
    const res = await fetch(`/api/projects/${project}/env`);
    const data = await res.json();
    setContent(data.content || '');
  }

  async function saveEnv() {
    setSaving(true);
    await fetch(`/api/projects/${project}/env`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="env-overlay">
      <div className="env-modal">
        <div className="env-header">
          <span>Environment Variables — {project}</span>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <textarea className="env-textarea" value={content} onChange={e => setContent(e.target.value)} placeholder="KEY=value\nANOTHER_KEY=value" spellCheck={false} />
        <div className="env-footer">
          <button className="btn btn-primary" onClick={saveEnv} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
