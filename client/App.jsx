import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Editor from './components/Editor.jsx';
import Preview from './components/Preview.jsx';
import Terminal from './components/Terminal.jsx';
import EnvEditor from './components/EnvEditor.jsx';
import './styles/layout.css';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [showEnv, setShowEnv] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
  }

  function handleFileChange() {
    setPreviewKey(k => k + 1);
  }

  return (
    <div className="studio-layout">
      <div className="studio-header">
        <div className="studio-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>ViralLinkUp Studio</span>
        </div>
        <div className="studio-actions">
          {activeProject && (
            <>
              <button className="btn btn-ghost" onClick={() => setShowEnv(true)}>⚙ Env</button>
              <button className="btn btn-ghost" onClick={() => setShowTerminal(t => !t)}>⬛ Terminal</button>
            </>
          )}
        </div>
      </div>

      <div className="studio-body">
        <Sidebar
          projects={projects}
          activeProject={activeProject}
          onSelectProject={p => { setActiveProject(p); setActiveFile(null); }}
          onRefresh={loadProjects}
          activeFile={activeFile}
          onSelectFile={setActiveFile}
        />

        <div className="studio-main">
          <div className="studio-work">
            <Editor
              project={activeProject}
              file={activeFile}
              onChange={handleFileChange}
            />
            <Preview
              key={previewKey}
              project={activeProject}
              file={activeFile}
            />
          </div>
          {showTerminal && (
            <Terminal project={activeProject?.name} />
          )}
        </div>
      </div>

      {showEnv && (
        <EnvEditor
          project={activeProject?.name}
          onClose={() => setShowEnv(false)}
        />
      )}
    </div>
  );
}
