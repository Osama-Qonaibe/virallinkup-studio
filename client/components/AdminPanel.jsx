import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

export default function AdminPanel({ onClose }) {
  const [token, setToken] = useState(sessionStorage.getItem('studio_admin_token') || '');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '' });
  const [loginError, setLoginError] = useState('');
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState({ name: '', key_value: '', project: '' });
  const [revealedKeys, setRevealedKeys] = useState({});
  const [addError, setAddError] = useState('');
  const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => { if (token) loadKeys(); }, [token]);

  async function login() {
    setLoginError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    });
    const data = await res.json();
    if (!res.ok) return setLoginError(data.error);
    sessionStorage.setItem('studio_admin_token', data.token);
    setToken(data.token);
  }

  async function loadKeys() {
    const res = await fetch('/api/admin/keys', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { setToken(''); sessionStorage.removeItem('studio_admin_token'); return; }
    setKeys(await res.json());
  }

  async function revealKey(id) {
    if (revealedKeys[id]) return setRevealedKeys(r => ({ ...r, [id]: undefined }));
    const res = await fetch(`/api/admin/keys/${id}/value`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRevealedKeys(r => ({ ...r, [id]: data.key_value }));
  }

  async function addKey() {
    setAddError('');
    if (!newKey.name || !newKey.key_value) return setAddError('Name and value required');
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newKey)
    });
    if (!res.ok) return setAddError((await res.json()).error);
    setNewKey({ name: '', key_value: '', project: '' });
    loadKeys();
  }

  async function deleteKey(id) {
    if (!confirm('Delete this key?')) return;
    await fetch(`/api/admin/keys/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadKeys();
  }

  async function changePassword() {
    setPwMsg('');
    if (pwForm.newPassword !== pwForm.confirm) return setPwMsg('Passwords do not match');
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newPassword: pwForm.newPassword })
    });
    const data = await res.json();
    setPwMsg(res.ok ? 'Password updated' : data.error);
    if (res.ok) setPwForm({ newPassword: '', confirm: '' });
  }

  function logout() {
    sessionStorage.removeItem('studio_admin_token');
    setToken('');
    setKeys([]);
  }

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-header">
          <span>🔐 API Keys Manager</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {token && <button className="btn btn-ghost" onClick={logout}>Logout</button>}
            <button className="btn btn-ghost" onClick={onClose}>✕</button>
          </div>
        </div>

        {!token ? (
          <div className="admin-login">
            <h3>Admin Login</h3>
            <input placeholder="Username" value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} />
            <input type="password" placeholder="Password" value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && login()} />
            {loginError && <span className="admin-error">{loginError}</span>}
            <button className="btn btn-primary" onClick={login}>Login</button>
            <p className="admin-hint">Default: admin / admin123</p>
          </div>
        ) : (
          <div className="admin-content">
            <div className="admin-section">
              <div className="admin-section-title">Add New Key</div>
              <div className="admin-add-form">
                <input placeholder="Name (e.g. OPENAI_KEY)" value={newKey.name} onChange={e => setNewKey(f => ({ ...f, name: e.target.value }))} />
                <input placeholder="Key value" value={newKey.key_value} onChange={e => setNewKey(f => ({ ...f, key_value: e.target.value }))} />
                <input placeholder="Project (optional)" value={newKey.project} onChange={e => setNewKey(f => ({ ...f, project: e.target.value }))} />
                {addError && <span className="admin-error">{addError}</span>}
                <button className="btn btn-primary" onClick={addKey}>Add Key</button>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-title">Stored Keys ({keys.length})</div>
              {keys.length === 0 ? <p className="admin-empty">No keys yet</p> : (
                <div className="keys-list">
                  {keys.map(k => (
                    <div key={k.id} className="key-row">
                      <div className="key-info">
                        <span className="key-name">{k.name}</span>
                        {k.project && <span className="key-project">{k.project}</span>}
                      </div>
                      <div className="key-value-row">
                        <code className="key-val">{revealedKeys[k.id] ? revealedKeys[k.id] : '••••••••••••'}</code>
                        <button className="btn btn-ghost btn-sm" onClick={() => revealKey(k.id)}>{revealedKeys[k.id] ? '🙈' : '👁'}</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteKey(k.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-section">
              <div className="admin-section-title">Change Password</div>
              <div className="admin-add-form">
                <input type="password" placeholder="New password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
                <input type="password" placeholder="Confirm password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                {pwMsg && <span className={pwMsg === 'Password updated' ? 'admin-success' : 'admin-error'}>{pwMsg}</span>}
                <button className="btn btn-primary" onClick={changePassword}>Update Password</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
