import React, { useState } from 'react';
import './HomeView.css';

export default function HomeView({ projects, onOpenProject, onRefresh, onOpenAdmin }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState(null);
  const [cloneUrl, setCloneUrl] = useState('');
  const [cloneName, setCloneName] = useState('');
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('node');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClone() {
    if (!cloneUrl.trim() || !cloneName.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/github/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: cloneUrl, name: cloneName })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await onRefresh();
      setMode(null); setCloneUrl(''); setCloneName('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, template: newTemplate })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await onRefresh();
      setMode(null); setNewName('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  const filtered = projects.filter(p => p.name.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className="home-layout">
      <div className="home-sidebar">
        <div className="home-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Studio</span>
        </div>
        <nav className="home-nav">
          <button className={`home-nav-btn ${!mode ? 'active' : ''}`} onClick={() => setMode(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </button>
          <button className={`home-nav-btn ${mode === 'new' ? 'active' : ''}`} onClick={() => { setMode('new'); setError(''); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Project
          </button>
          <button className={`home-nav-btn ${mode === 'clone' ? 'active' : ''}`} onClick={() => { setMode('clone'); setError(''); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
            Clone from GitHub
          </button>
        </nav>
        <div className="home-sidebar-bottom">
          <button className="home-nav-btn" onClick={onOpenAdmin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Admin Panel
          </button>
        </div>
        <div className="home-sidebar-projects">
          <div className="home-section-label">Recent</div>
          {projects.slice(0, 8).map(p => (
            <button key={p.name} className="home-recent-item" onClick={() => onOpenProject(p)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="home-main">
        {!mode && (
          <>
            <div className="home-hero">
              <h1 className="home-title">ViralLinkUp Studio</h1>
              <p className="home-subtitle">Your AI-powered development workspace</p>
            </div>
            <div className="home-search-wrap">
              <div className="home-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input className="home-search-input" placeholder="Search projects..." value={input} onChange={e => setInput(e.target.value)} autoFocus />
              </div>
              <div className="home-quick-btns">
                <button className="home-quick-btn" onClick={() => { setMode('new'); setError(''); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New
                </button>
                <button className="home-quick-btn" onClick={() => { setMode('clone'); setError(''); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
                  Clone
                </button>
              </div>
            </div>
            <div className="home-projects-grid">
              {filtered.length === 0 && input && <div className="home-empty">No projects found</div>}
              {filtered.map(p => (
                <button key={p.name} className="home-project-card" onClick={() => onOpenProject(p)}>
                  <div className="hpc-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                  </div>
                  <div className="hpc-name">{p.name}</div>
                  <div className="hpc-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'clone' && (
          <div className="home-form-wrap">
            <h2>Clone from GitHub</h2>
            <p>Paste a GitHub repository URL to clone it into your workspace.</p>
            <div className="home-form">
              <label>Repository URL</label>
              <input placeholder="https://github.com/user/repo" value={cloneUrl} onChange={e => setCloneUrl(e.target.value)} autoFocus />
              <label>Project Name</label>
              <input placeholder="my-project" value={cloneName} onChange={e => setCloneName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClone()} />
              {error && <span className="home-error">{error}</span>}
              <div className="home-form-actions">
                <button className="btn btn-primary" onClick={handleClone} disabled={loading}>{loading ? 'Cloning...' : 'Clone Repository'}</button>
                <button className="btn btn-ghost" onClick={() => { setMode(null); setError(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {mode === 'new' && (
          <div className="home-form-wrap">
            <h2>New Project</h2>
            <p>Create a new project from a template.</p>
            <div className="home-form">
              <label>Project Name</label>
              <input placeholder="my-project" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              <label>Template</label>
              <select value={newTemplate} onChange={e => setNewTemplate(e.target.value)}>
                <option value="node">Node.js</option>
                <option value="html">HTML / CSS / JS</option>
              </select>
              {error && <span className="home-error">{error}</span>}
              <div className="home-form-actions">
                <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
                <button className="btn btn-ghost" onClick={() => { setMode(null); setError(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
