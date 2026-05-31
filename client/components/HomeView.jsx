import React, { useState } from 'react';
import './HomeView.css';

const ICONS = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  github: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>,
  folder: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
};

const EXT_COLOR = { js:'#f7df1e', ts:'#3178c6', jsx:'#61dafb', tsx:'#61dafb', php:'#777bb4', py:'#3776ab', css:'#264de4', html:'#e34f26', md:'#c8c8d8', json:'#fbbf24' };

function getProjectLang(name) {
  const n = name.toLowerCase();
  if (n.includes('laravel') || n.includes('php')) return { label: 'PHP', color: '#777bb4' };
  if (n.includes('next') || n.includes('react')) return { label: 'React', color: '#61dafb' };
  if (n.includes('node') || n.includes('express')) return { label: 'Node', color: '#68a063' };
  if (n.includes('python') || n.includes('django')) return { label: 'Python', color: '#3776ab' };
  return { label: 'JS', color: '#f7df1e' };
}

export default function HomeView({ projects, onOpenProject, onRefresh, onOpenAdmin }) {
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [cloneUrl, setCloneUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function createProject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true); setError('');
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setShowNewModal(false); setNewName(''); onRefresh(); }
    else setError(data.error || 'Failed');
  }

  async function cloneProject(e) {
    e.preventDefault();
    if (!cloneUrl.trim()) return;
    setLoading(true); setError('');
    const res = await fetch('/api/github/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cloneUrl.trim() })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setShowCloneModal(false); setCloneUrl(''); onRefresh(); }
    else setError(data.error || 'Failed');
  }

  async function deleteProject() {
    if (!toDelete) return;
    await fetch(`/api/projects/${toDelete}`, { method: 'DELETE' });
    setToDelete(null);
    onRefresh();
  }

  return (
    <div className="hv">
      <div className="hv-sidebar">
        <div className="hv-sidebar-top">
          <div className="hv-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              <path d="M2 12l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
            <span className="hv-logo-text">Studio</span>
          </div>
        </div>
        <nav className="hv-nav">
          <a className="hv-nav-item active">{ICONS.folder}<span>Projects</span></a>
          <a className="hv-nav-item" onClick={() => setShowNewModal(true)}>{ICONS.plus}<span>New Project</span></a>
          <a className="hv-nav-item" onClick={() => setShowCloneModal(true)}>{ICONS.github}<span>Clone from GitHub</span></a>
        </nav>
        <div className="hv-nav-bottom">
          <a className="hv-nav-item" onClick={onOpenAdmin}>{ICONS.settings}<span>Admin Panel</span></a>
        </div>
        {projects.length > 0 && (
          <div className="hv-recents">
            <div className="hv-recents-label">Recent</div>
            {projects.slice(0, 5).map(p => (
              <button key={p.name} className="hv-recent-item" onClick={() => onOpenProject(p)}>
                {ICONS.folder}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="hv-main">
        <div className="hv-hero">
          <h1 className="hv-title">ViralLinkUp <span>Studio</span></h1>
          <p className="hv-subtitle">Your AI-powered development workspace</p>
        </div>
        <div className="hv-search-row">
          <div className="hv-search-wrap">
            {ICONS.search}
            <input
              className="hv-search"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="hv-btn-outline" onClick={() => setShowNewModal(true)}>{ICONS.plus}<span>New</span></button>
          <button className="hv-btn-outline" onClick={() => setShowCloneModal(true)}>{ICONS.github}<span>Clone</span></button>
        </div>
        <div className="hv-grid">
          {filtered.length === 0 ? (
            <div className="hv-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              <p>No projects found</p>
            </div>
          ) : filtered.map(p => {
            const lang = getProjectLang(p.name);
            return (
              <div key={p.name} className="hv-card" onClick={() => onOpenProject(p)}>
                <div className="hv-card-top">
                  <div className="hv-card-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={lang.color} strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                  </div>
                  <span className="hv-card-lang" style={{ color: lang.color }}>{lang.label}</span>
                  <button
                    className="hv-card-del"
                    onClick={ev => { ev.stopPropagation(); setToDelete(p.name); }}
                    title="Delete"
                  >{ICONS.trash}</button>
                </div>
                <div className="hv-card-name">{p.name}</div>
                <div className="hv-card-path">{p.path}</div>
              </div>
            );
          })}
        </div>
      </div>

      {showNewModal && (
        <div className="hv-overlay" onClick={() => setShowNewModal(false)}>
          <div className="hv-modal" onClick={e => e.stopPropagation()}>
            <div className="hv-modal-header"><h3>New Project</h3><button className="ws-icon-btn" onClick={() => setShowNewModal(false)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={createProject}>
              <input className="hv-input" placeholder="Project name" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              {error && <p className="hv-error">{error}</p>}
              <div className="hv-modal-actions">
                <button type="button" className="hv-btn-ghost" onClick={() => setShowNewModal(false)}>Cancel</button>
                <button type="submit" className="hv-btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloneModal && (
        <div className="hv-overlay" onClick={() => setShowCloneModal(false)}>
          <div className="hv-modal" onClick={e => e.stopPropagation()}>
            <div className="hv-modal-header"><h3>Clone Repository</h3><button className="ws-icon-btn" onClick={() => setShowCloneModal(false)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={cloneProject}>
              <input className="hv-input" placeholder="https://github.com/user/repo" value={cloneUrl} onChange={e => setCloneUrl(e.target.value)} autoFocus />
              {error && <p className="hv-error">{error}</p>}
              <div className="hv-modal-actions">
                <button type="button" className="hv-btn-ghost" onClick={() => setShowCloneModal(false)}>Cancel</button>
                <button type="submit" className="hv-btn-primary" disabled={loading}>{loading ? 'Cloning…' : 'Clone'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toDelete && (
        <div className="hv-overlay" onClick={() => setToDelete(null)}>
          <div className="hv-modal" onClick={e => e.stopPropagation()}>
            <div className="hv-modal-header"><h3>Delete Project</h3></div>
            <p className="hv-confirm-text">Delete <strong>{toDelete}</strong>? This cannot be undone.</p>
            <div className="hv-modal-actions">
              <button className="hv-btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="hv-btn-danger" onClick={deleteProject}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
