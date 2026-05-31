import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView.jsx';
import WorkspaceView from './components/WorkspaceView.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import './styles/global.css';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const res = await fetch('/api/projects');
    setProjects(await res.json());
  }

  return (
    <>
      {activeProject ? (
        <WorkspaceView
          project={activeProject}
          projects={projects}
          onClose={() => setActiveProject(null)}
          onRefresh={loadProjects}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      ) : (
        <HomeView
          projects={projects}
          onOpenProject={setActiveProject}
          onRefresh={loadProjects}
          onOpenAdmin={() => setShowAdmin(true)}
        />
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}
