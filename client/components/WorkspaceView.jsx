import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import AiChat from './AiChat.jsx';
import './WorkspaceView.css';

const LANG_MAP = { js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',css:'css',html:'html',json:'json',md:'markdown',py:'python',sh:'shell' };

const ICONS = {
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
  folderOpen: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  file: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chevronRight: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  back: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  deploy: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>,
  ai: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>,
  close: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  externalLink: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

function FileTree({ items, onSelect, activeFile, depth = 0 }) {
  const [open, setOpen] = useState({});
  return (
    <div>
      {(items || []).map(item => (
        <div key={item.path}>
          {item.type === 'dir' ? (
            <>
              <button
                className="ws-tree-item ws-tree-dir"
                style={{ paddingLeft: `${(depth * 12) + 12}px` }}
                onClick={() => setOpen(o => ({ ...o, [item.path]: !o[item.path] }))}
              >
                <span className={`ws-tree-chevron ${open[item.path] ? 'open' : ''}`}>{ICONS.chevronRight}</span>
                <span className="ws-tree-icon dir">{open[item.path] ? ICONS.folderOpen : ICONS.folder}</span>
                <span className="ws-tree-label">{item.name}</span>
              </button>
              {open[item.path] && <FileTree items={item.children} onSelect={onSelect} activeFile={activeFile} depth={depth + 1} />}
            </>
          ) : (
            <button
              className={`ws-tree-item ${activeFile?.path === item.path ? 'active' : ''}`}
              style={{ paddingLeft: `${(depth * 12) + 24}px` }}
              onClick={() => onSelect(item)}
            >
              <span className="ws-tree-icon file">{ICONS.file}</span>
              <span className="ws-tree-label">{item.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function WorkspaceView({ project, projects, onClose, onRefresh, onOpenAdmin }) {
  const [fileTree, setFileTree] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightPanel, setRightPanel] = useState('ai');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState('');
  const saveTimer = useRef(null);

  useEffect(() => { loadTree(); }, [project]);

  async function loadTree() {
    const res = await fetch(`/api/files/${project.name}/tree`);
    setFileTree(await res.json());
  }

  async function selectFile(file) {
    setActiveFile(file);
    const res = await fetch(`/api/files/${project.name}/read?path=${encodeURIComponent(file.path)}`);
    const data = await res.json();
    setFileContent(data.content || '');
    setIsDirty(false);
    const ext = file.name.split('.').pop();
    if (['html','jsx','tsx','js','ts'].includes(ext)) {
      setPreviewUrl(`/api/preview/${project.name}?file=${encodeURIComponent(file.path)}`);
    }
  }

  function handleEditorChange(value) {
    setFileContent(value);
    setIsDirty(true);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(value), 1000);
  }

  async function autoSave(value) {
    if (!activeFile) return;
    setSaving(true);
    await fetch(`/api/files/${project.name}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: activeFile.path, content: value })
    });
    setSaving(false);
    setIsDirty(false);
  }

  async function deploy() {
    setDeploying(true); setDeployMsg('');
    try {
      const res = await fetch(`/api/github/${project.name}/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Deploy from ViralLinkUp Studio' })
      });
      const data = await res.json();
      setDeployMsg(res.ok ? 'Deployed' : data.error);
    } catch (e) { setDeployMsg(e.message); }
    setDeploying(false);
    setTimeout(() => setDeployMsg(''), 4000);
  }

  const ext = activeFile?.name?.split('.').pop() || 'txt';
  const language = LANG_MAP[ext] || 'plaintext';

  return (
    <div className="ws">
      <div className="ws-topbar">
        <div className="ws-topbar-left">
          <button className="ws-icon-btn" onClick={onClose} title="Home">{ICONS.back}</button>
          <div className="ws-logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
              <path d="M2 12l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
          </div>
          <span className="ws-project-label">{project.name}</span>
          {activeFile && <><span className="ws-breadcrumb-sep">/</span><span className="ws-breadcrumb-file">{activeFile.name}</span></>}
          {saving && <span className="ws-status saving">saving</span>}
          {isDirty && !saving && <span className="ws-dot-dirty" />}
        </div>
        <div className="ws-topbar-center">
          <button
            className={`ws-tab-btn ${!leftCollapsed ? 'active' : ''}`}
            onClick={() => setLeftCollapsed(f => !f)}
            title="Files"
          >
            {ICONS.folder}
            <span>Explorer</span>
          </button>
          <button
            className={`ws-tab-btn ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(f => !f)}
            title="Preview"
          >
            {ICONS.eye}
            <span>Preview</span>
          </button>
        </div>
        <div className="ws-topbar-right">
          <button className="ws-icon-btn" onClick={() => window.open(`/api/projects/${project.name}/download`, '_blank')} title="Download">{ICONS.download}</button>
          <button className="ws-deploy-btn" onClick={deploy} disabled={deploying}>
            {ICONS.deploy}
            <span>{deploying ? 'Deploying…' : 'Deploy'}</span>
          </button>
          {deployMsg && <span className={`ws-deploy-msg ${deployMsg === 'Deployed' ? 'ok' : 'err'}`}>{deployMsg === 'Deployed' ? '✓' : '✗'} {deployMsg}</span>}
        </div>
      </div>

      <div className="ws-body">
        <div className={`ws-left ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="ws-panel-header">
            <span className="ws-panel-title">Explorer</span>
            <button className="ws-icon-btn sm" onClick={loadTree} title="Refresh">{ICONS.refresh}</button>
          </div>
          <div className="ws-panel-body">
            <FileTree items={fileTree} onSelect={selectFile} activeFile={activeFile} />
          </div>
        </div>

        <div className="ws-main">
          {activeFile ? (
            showPreview && previewUrl ? (
              <div className="ws-split">
                <div className="ws-split-editor">
                  <MonacoEditor
                    height="100%" language={language} value={fileContent}
                    theme="vs-dark" onChange={handleEditorChange}
                    options={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', smoothScrolling: true, cursorBlinking: 'smooth', padding: { top: 16 } }}
                  />
                </div>
                <div className="ws-split-preview">
                  <div className="ws-preview-bar">
                    <span>Preview</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="ws-icon-btn sm" onClick={() => window.open(previewUrl, '_blank')}>{ICONS.externalLink}</button>
                      <button className="ws-icon-btn sm" onClick={() => setShowPreview(false)}>{ICONS.close}</button>
                    </div>
                  </div>
                  <iframe src={previewUrl} className="ws-iframe" title="preview" />
                </div>
              </div>
            ) : (
              <MonacoEditor
                height="100%" language={language} value={fileContent}
                theme="vs-dark" onChange={handleEditorChange}
                options={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', smoothScrolling: true, cursorBlinking: 'smooth', padding: { top: 16 } }}
              />
            )
          ) : (
            <div className="ws-empty-editor">
              <div className="ws-empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p>Select a file to edit</p>
            </div>
          )}
        </div>

        <div className="ws-right">
          <div className="ws-right-tabs">
            <button className={`ws-rtab ${rightPanel === 'ai' ? 'active' : ''}`} onClick={() => setRightPanel('ai')}>
              {ICONS.ai}
              <span>AI</span>
            </button>
          </div>
          <div className="ws-right-body">
            {rightPanel === 'ai' && <AiChat activeFile={activeFile} fileContent={fileContent} />}
          </div>
        </div>
      </div>
    </div>
  );
}
