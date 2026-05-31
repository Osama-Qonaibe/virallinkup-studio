import React, { useEffect, useRef, useState } from 'react';
import './Preview.css';

export default function Preview({ project, file }) {
  const iframeRef = useRef(null);
  const wsRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!project) return;
    const entryFile = file?.name?.endsWith('.html') ? file.path : 'index.html';
    setPreviewUrl(`/api/projects/${project.name}/preview?file=${entryFile}`);
    connectWs(project.name);
    return () => wsRef.current?.close();
  }, [project]);

  useEffect(() => {
    if (file?.name?.endsWith('.html')) {
      setPreviewUrl(`/api/projects/${project?.name}/preview?file=${file.path}`);
    }
  }, [file]);

  function connectWs(name) {
    const ws = new WebSocket(`ws://${location.host}/ws?type=preview&project=${name}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setTimeout(() => connectWs(name), 3000); };
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload' && iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
    };
    wsRef.current = ws;
  }

  return (
    <div className="preview-panel">
      <div className="preview-tab">
        <span>Preview</span>
        <div className={`preview-status ${connected ? 'connected' : ''}`}>{connected ? '● Live' : '○ Offline'}</div>
        {previewUrl && <button className="btn btn-ghost" onClick={() => iframeRef.current && (iframeRef.current.src = iframeRef.current.src)}>↺</button>}
      </div>
      {project ? (
        <iframe ref={iframeRef} src={previewUrl} className="preview-iframe" title="Preview" sandbox="allow-scripts allow-same-origin allow-forms" />
      ) : (
        <div className="preview-empty">Select a project to preview</div>
      )}
    </div>
  );
}
