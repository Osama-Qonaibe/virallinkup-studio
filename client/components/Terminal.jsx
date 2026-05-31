import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import './Terminal.css';

export default function Terminal({ project }) {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const fitAddon = useRef(new FitAddon());

  useEffect(() => {
    const term = new XTerm({
      theme: { background: '#0d0d0d', foreground: '#e8e8e8', cursor: '#7c3aed' },
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      fontSize: 13,
      cursorBlink: true,
      scrollback: 1000
    });
    term.loadAddon(fitAddon.current);
    term.open(containerRef.current);
    fitAddon.current.fit();
    termRef.current = term;

    connectWs(project);

    const ro = new ResizeObserver(() => fitAddon.current.fit());
    ro.observe(containerRef.current);

    return () => { term.dispose(); wsRef.current?.close(); ro.disconnect(); };
  }, [project]);

  function connectWs(proj) {
    const url = `ws://${location.host}/ws?type=terminal${proj ? `&project=${proj}` : ''}`;
    const ws = new WebSocket(url);
    ws.onopen = () => termRef.current?.write('\x1b[32mConnected\x1b[0m\r\n');
    ws.onclose = () => { termRef.current?.write('\r\n\x1b[31mDisconnected\x1b[0m\r\n'); setTimeout(() => connectWs(proj), 3000); };
    ws.onmessage = msg => {
      const data = JSON.parse(msg.data);
      if (data.type === 'output') termRef.current?.write(data.data);
    };
    termRef.current?.onData(d => ws.readyState === 1 && ws.send(JSON.stringify({ type: 'input', data: d })));
    wsRef.current = ws;
  }

  return (
    <div className="terminal-panel">
      <div className="terminal-tab"><span>Terminal</span>{project && <span className="terminal-project">{project}</span>}</div>
      <div ref={containerRef} className="terminal-container" />
    </div>
  );
}
