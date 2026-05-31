import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import AiChat from './AiChat.jsx';
import './WorkspaceView.css';

const LANG_MAP = { js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',css:'css',html:'html',json:'json',md:'markdown',py:'python',sh:'shell' };

function FileTree({ items, onSelect, activeFile, depth = 0 }) {
  const [open, setOpen] = useState({});
  return (
    <div style={{ paddingLeft: depth * 10 }}>
      {(items || []).map(item => (
        <div key={item.path}>
          {item.type === 'dir' ? (
            <>
              <div className="ws-file-item ws-dir" onClick={() => setOpen(o => ({ ...o, [item.path]: !o[item.path] }))}>
                <span className="ws-file-chevron">{open[item.path] ? '▾' : '▸'}</span>
                <span>{item.name}</span>
              </div>
              {open[item.path] && <FileTree items={item.children} onSelect={onSelect} activeFile={activeFile} depth={depth + 1} />}
            </>
          ) : (
            <div className={`ws-file-item ${activeFile?.path === item.path ? 'active' : ''}`} onClick={() => onSelect(item)}>
              <span className="ws-file-dot">·</span>
              <span>{item.name}</span>
            </div>
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
  const [showFiles, setShowFiles] = useState(true);
  const [showAi, setShowAi] = useState(true);
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
      setDeployMsg(res.ok ? '✓ Deployed' : `✗ ${data.error}`);
    } catch (e) { setDeployMsg(`✗ ${e.message}`); }
    setDeploying(false);
    setTimeout(() => setDeployMsg(''), 4000);
  }

  async function downloadZip() {
    window.open(`/api/projects/${project.name}/download`, '_blank');
  }

  const ext = activeFile?.name?.split('.').pop() || 'txt';
  const language = LANG_MAP[ext] || 'plaintext';

  return (
    <div className="ws-layout">
      <div className="ws-header">
        <div className="ws-header-left">
          <button className="ws-back-btn" onClick={onClose} title="Back to Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="ws-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="ws-project-name">{project.name}</span>
          {activeFile && <span className="ws-file-breadcrumb">/ {activeFile.name}</span>}
          {saving && <span className="ws-saving">saving...</span>}
          {isDirty && !saving && <span className="ws-dirty">●</span>}
        </div>
        <div className="ws-header-right">
          <button className={`ws-header-btn ${showFiles ? 'active' : ''}`} onClick={() => setShowFiles(f => !f)} title="Toggle File Tree">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </button>
          <button className={`ws-header-btn ${showPreview ? 'active' : ''}`} onClick={() => setShowPreview(f => !f)} title="Toggle Preview">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          {previewUrl && (
            <button className="ws-header-btn" onClick={() => window.open(previewUrl, '_blank')} title="Open in Browser">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          )}
          <div className="ws-divider" />
          <button className="ws-header-btn" onClick={downloadZip} title="Download as ZIP">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
          <button className="ws-header-btn ws-deploy-btn" onClick={deploy} disabled={deploying} title="Deploy to GitHub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
            {deploying ? 'Deploying...' : 'Deploy'}
          </button>
          {deployMsg && <span className={`ws-deploy-msg ${deployMsg.startsWith('✓') ? 'success' : 'error'}`}>{deployMsg}</span>}
          <div className="ws-divider" />
          <button className={`ws-header-btn ${showAi ? 'active' : ''}`} onClick={() => setShowAi(f => !f)} title="AI Assistant">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            AI
          </button>
        </div>
      </div>

      <div className="ws-body">
        {showFiles && (
          <div className="ws-filetree">
            <div className="ws-filetree-header">
              <span>{project.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={loadTree} title="Refresh">↺</button>
            </div>
            <div className="ws-filetree-body">
              <FileTree items={fileTree} onSelect={selectFile} activeFile={activeFile} />
            </div>
          </div>
        )}

        <div className="ws-editor-area">
          {activeFile ? (
            <MonacoEditor
              height="100%"
              language={language}
              value={fileContent}
              theme="vs-dark"
              onChange={handleEditorChange}
              options={{ fontSize: 13, fontFamily: 'JetBrains Mono, Fira Code, monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', lineNumbers: 'on', smoothScrolling: true, cursorBlinking: 'smooth' }}
            />
          ) : (
            <div className="ws-editor-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>Select a file to edit</p>
            </div>
          )}
        </div>

        {showPreview && activeFile && (
          <div className="ws-preview-area">
            <div className="ws-preview-header">
              <span>Preview</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <iframe src={previewUrl} className="ws-preview-iframe" title="preview" />
          </div>
        )}

        {showAi && (
          <AiChat activeFile={activeFile} fileContent={fileContent} />
        )}
      </div>
    </div>
  );
}
