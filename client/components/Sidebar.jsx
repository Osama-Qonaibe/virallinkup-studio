import React, { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar({ projects, activeProject, onSelectProject, onRefresh, activeFile, onSelectFile }) {
  const [fileTree, setFileTree] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState('html');
  const [cloneUrl, setCloneUrl] = useState('');
  const [cloneName, setCloneName] = useState('');

  useEffect(() => {
    if (activeProject) loadTree(activeProject.name);
  }, [activeProject]);

  async function loadTree(name) {
    const res = await fetch(`/api/files/${name}/tree`);
    const data = await res.json();
    setFileTree(data);
  }

  async function createProject() {
    if (!newName.trim()) return;
    await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, template: newTemplate }) });
    setShowNew(false); setNewName('');
    onRefresh();
  }

  async function cloneProject() {
    if (!cloneUrl.trim() || !cloneName.trim()) return;
    await fetch('/api/github/clone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repoUrl: cloneUrl, name: cloneName }) });
    setShowClone(false); setCloneUrl(''); setCloneName('');
    onRefresh();
  }

  async function deleteProject(name, e) {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/projects/${name}`, { method: 'DELETE' });
    onRefresh();
    if (activeProject?.name === name) onSelectProject(null);
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-header">
          <span>Projects</span>
          <div className="sidebar-header-btns">
            <button className="btn btn-ghost" title="New Project" onClick={() => setShowNew(true)}>+</button>
            <button className="btn btn-ghost" title="Clone from GitHub" onClick={() => setShowClone(true)}>⬇</button>
          </div>
        </div>

        {showNew && (
          <div className="sidebar-form">
            <input placeholder="project-name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} />
            <select value={newTemplate} onChange={e => setNewTemplate(e.target.value)}>
              <option value="html">HTML/CSS/JS</option>
              <option value="node">Node.js</option>
            </select>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={createProject}>Create</button>
              <button className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showClone && (
          <div className="sidebar-form">
            <input placeholder="GitHub URL" value={cloneUrl} onChange={e => setCloneUrl(e.target.value)} />
            <input placeholder="Project name" value={cloneName} onChange={e => setCloneName(e.target.value)} />
            <div className="form-actions">
              <button className="btn btn-primary" onClick={cloneProject}>Clone</button>
              <button className="btn btn-ghost" onClick={() => setShowClone(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="project-list">
          {projects.map(p => (
            <div key={p.name} className={`project-item ${activeProject?.name === p.name ? 'active' : ''}`} onClick={() => onSelectProject(p)}>
              <span className="project-icon">📁</span>
              <span className="project-name">{p.name}</span>
              <button className="btn btn-danger project-delete" onClick={e => deleteProject(p.name, e)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {activeProject && (
        <div className="sidebar-section sidebar-files">
          <div className="sidebar-header"><span>Files</span></div>
          <FileTree items={fileTree} onSelect={onSelectFile} activeFile={activeFile} />
        </div>
      )}
    </div>
  );
}

function FileTree({ items, onSelect, activeFile, depth = 0 }) {
  const [open, setOpen] = useState({});
  return (
    <div style={{ paddingLeft: depth * 12 }}>
      {items.map(item => (
        <div key={item.path}>
          {item.type === 'dir' ? (
            <>
              <div className="file-item dir" onClick={() => setOpen(o => ({ ...o, [item.path]: !o[item.path] }))}>
                <span>{open[item.path] ? '▾' : '▸'}</span>
                <span>{item.name}</span>
              </div>
              {open[item.path] && <FileTree items={item.children} onSelect={onSelect} activeFile={activeFile} depth={depth + 1} />}
            </>
          ) : (
            <div className={`file-item ${activeFile?.path === item.path ? 'active' : ''}`} onClick={() => onSelect(item)}>
              <span className="file-dot">·</span>
              <span>{item.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
