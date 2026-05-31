import React, { useState, useEffect, useCallback } from 'react';
import './AdminPanel.css';

const TOKEN_KEY = 'studio_admin_token';

function getToken() { return sessionStorage.getItem(TOKEN_KEY) || ''; }

export default function AdminPanel({ onClose }) {
  const [token, setToken]       = useState(getToken);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [keys, setKeys]         = useState([]);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied]     = useState({});

  const [form, setForm] = useState({ name: '', key_value: '', project: '', endpoint: '' });
  const [formErr, setFormErr]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [saveOk, setSaveOk]     = useState(false);

  const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadKeys = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/admin/keys', { headers: authHeader });
    if (res.status === 401) { logout(); return; }
    setKeys(await res.json());
  }, [token]);

  useEffect(() => { loadKeys(); }, [loadKeys]);

  async function login(e) {
    e.preventDefault();
    setLoginErr(''); setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) { setLoginErr(data.error); return; }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } finally { setLoggingIn(false); }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(''); setKeys([]);
  }

  async function revealKey(id) {
    if (revealed[id] !== undefined) {
      setRevealed(r => { const n = { ...r }; delete n[id]; return n; });
      return;
    }
    const res = await fetch(`/api/admin/keys/${id}/value`, { headers: authHeader });
    const data = await res.json();
    setRevealed(r => ({ ...r, [id]: data.key_value }));
  }

  async function copyKey(id) {
    const val = revealed[id];
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopied(c => ({ ...c, [id]: true }));
    setTimeout(() => setCopied(c => { const n = { ...c }; delete n[id]; return n; }), 2000);
  }

  async function saveKey(e) {
    e.preventDefault();
    setFormErr(''); setSaveOk(false);
    if (!form.name.trim() || !form.key_value.trim()) { setFormErr('Name and value are required'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          name: form.name.trim(),
          key_value: form.key_value.trim(),
          project: form.project.trim() || null,
          endpoint: form.endpoint.trim() || null
        })
      });
      if (!res.ok) { setFormErr((await res.json()).error); return; }
      setForm({ name: '', key_value: '', project: '', endpoint: '' });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
      await loadKeys();
    } finally { setSaving(false); }
  }

  async function deleteKey(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/admin/keys/${id}`, { method: 'DELETE', headers: authHeader });
    setRevealed(r => { const n = { ...r }; delete n[id]; return n; });
    await loadKeys();
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="ap-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ap-panel">

        <div className="ap-header">
          <div className="ap-header-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            API Keys
          </div>
          <div className="ap-header-actions">
            {token && <button className="ap-btn-ghost" onClick={logout}>Sign out</button>}
            <button className="ap-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {!token ? (
          <form className="ap-login" onSubmit={login}>
            <div className="ap-login-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            </div>
            <h2 className="ap-login-title">Admin Access</h2>
            <p className="ap-login-sub">Sign in to manage API keys</p>
            <div className="ap-field">
              <label>Email</label>
              <input type="email" autoFocus placeholder="admin@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="ap-field">
              <label>Password</label>
              <input type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {loginErr && <div className="ap-error">{loginErr}</div>}
            <button className="ap-btn-primary" type="submit" disabled={loggingIn}>
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <div className="ap-body">
            <form className="ap-add-card" onSubmit={saveKey}>
              <div className="ap-card-title">Add New Key</div>
              <div className="ap-grid-2">
                <div className="ap-field">
                  <label>Name <span className="ap-required">*</span></label>
                  <input placeholder="e.g. OPENAI_API_KEY" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="ap-field">
                  <label>Project</label>
                  <input placeholder="e.g. my-app (optional)" value={form.project}
                    onChange={e => setForm(f => ({ ...f, project: e.target.value }))} />
                </div>
              </div>
              <div className="ap-field">
                <label>Key Value <span className="ap-required">*</span></label>
                <input type="password" placeholder="sk-…" value={form.key_value}
                  onChange={e => setForm(f => ({ ...f, key_value: e.target.value }))} />
              </div>
              <div className="ap-field">
                <label>Endpoint URL</label>
                <input placeholder="https://api.openai.com/v1 (optional)" value={form.endpoint}
                  onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))} />
              </div>
              {formErr && <div className="ap-error">{formErr}</div>}
              <div className="ap-form-footer">
                {saveOk && <span className="ap-success">✓ Key saved</span>}
                <button className="ap-btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Key'}
                </button>
              </div>
            </form>

            <div className="ap-keys-section">
              <div className="ap-keys-header">
                <span className="ap-card-title">Stored Keys</span>
                <span className="ap-badge">{keys.length}</span>
                <button className="ap-btn-ghost ap-refresh" onClick={loadKeys} title="Refresh">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                </button>
              </div>

              {keys.length === 0 ? (
                <div className="ap-empty">No keys stored yet</div>
              ) : (
                <div className="ap-keys-list">
                  {keys.map(k => (
                    <div key={k.id} className="ap-key-row">
                      <div className="ap-key-meta">
                        <span className="ap-key-name">{k.name}</span>
                        <div className="ap-key-tags">
                          {k.project && <span className="ap-tag">{k.project}</span>}
                          {k.endpoint && <span className="ap-tag ap-tag-url" title={k.endpoint}>⬡ endpoint</span>}
                          <span className="ap-tag ap-tag-date">{formatDate(k.created_at)}</span>
                        </div>
                      </div>
                      <div className="ap-key-val-row">
                        <code className="ap-key-val">
                          {revealed[k.id] ? revealed[k.id] : '•'.repeat(24)}
                        </code>
                        <div className="ap-key-actions">
                          <button className="ap-icon-btn" onClick={() => revealKey(k.id)}
                            title={revealed[k.id] ? 'Hide' : 'Reveal'}>
                            {revealed[k.id]
                              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            }
                          </button>
                          {revealed[k.id] && (
                            <button className="ap-icon-btn" onClick={() => copyKey(k.id)} title="Copy">
                              {copied[k.id]
                                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                              }
                            </button>
                          )}
                          <button className="ap-icon-btn ap-icon-del" onClick={() => deleteKey(k.id, k.name)} title="Delete">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
