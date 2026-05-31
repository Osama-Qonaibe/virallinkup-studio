import React, { useState, useEffect, useRef } from 'react';
import './AiChat.css';

export default function AiChat({ activeFile, fileContent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ keyId: '', baseUrl: '', model: '', useFileContext: true });
  const [keys, setKeys] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadKeys(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadKeys() {
    try {
      const token = sessionStorage.getItem('studio_admin_token');
      if (!token) return;
      const res = await fetch('/api/admin/keys', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setKeys(await res.json());
    } catch {}
  }

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          keyId: config.keyId || null,
          baseUrl: config.baseUrl || null,
          model: config.model || null,
          fileContext: config.useFileContext && fileContent ? fileContent : null
        })
      });
      const data = await res.json();
      if (data.error) {
        setMessages(m => [...m, { role: 'assistant', content: `❌ Error: ${data.error}` }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: data.content }]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: `❌ ${e.message}` }]);
    }
    setLoading(false);
  }

  function renderContent(content) {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        return (
          <div key={i} className="chat-code-block">
            {lang && <span className="chat-code-lang">{lang}</span>}
            <pre><code>{code}</code></pre>
          </div>
        );
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
    });
  }

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <span>🤖 AI Assistant</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {activeFile && (
            <label className="chat-ctx-toggle" title="Include current file as context">
              <input type="checkbox" checked={config.useFileContext} onChange={e => setConfig(c => ({ ...c, useFileContext: e.target.checked }))} />
              <span>ctx</span>
            </label>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowConfig(s => !s); loadKeys(); }}>⚙</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setMessages([])}>🗑</button>
        </div>
      </div>

      {showConfig && (
        <div className="ai-config">
          <div className="ai-config-row">
            <label>API Key</label>
            <select value={config.keyId} onChange={e => setConfig(c => ({ ...c, keyId: e.target.value }))}>
              <option value="">None / env</option>
              {keys.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
          <div className="ai-config-row">
            <label>Base URL</label>
            <input placeholder="https://api.openai.com/v1" value={config.baseUrl} onChange={e => setConfig(c => ({ ...c, baseUrl: e.target.value }))} />
          </div>
          <div className="ai-config-row">
            <label>Model</label>
            <input placeholder="gpt-4o-mini" value={config.model} onChange={e => setConfig(c => ({ ...c, model: e.target.value }))} />
          </div>
        </div>
      )}

      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="ai-empty">Ask anything about your code...</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`ai-message ai-message-${m.role}`}>
            <span className="ai-role">{m.role === 'user' ? '👤' : '🤖'}</span>
            <div className="ai-content">{renderContent(m.content)}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-message ai-message-assistant">
            <span className="ai-role">🤖</span>
            <div className="ai-typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          className="ai-input"
          placeholder={activeFile ? `Ask about ${activeFile.name}...` : 'Ask anything...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
        />
        <button className="btn btn-primary ai-send" onClick={send} disabled={loading}>➤</button>
      </div>
    </div>
  );
}
