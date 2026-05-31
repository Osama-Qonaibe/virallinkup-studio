import Dockerode from 'dockerode';

const docker = new Dockerode(
  process.env.DOCKER_SOCKET
    ? { socketPath: process.env.DOCKER_SOCKET }
    : { socketPath: '/var/run/docker.sock' }
);

export async function runInContainer({ image, cmd, projectPath, env = {} }) {
  const container = await docker.createContainer({
    Image: image,
    Cmd: cmd,
    HostConfig: {
      Binds: [`${projectPath}:/workspace:rw`],
      AutoRemove: true,
      Memory: 512 * 1024 * 1024,
      NanoCpus: 1e9,
    },
    WorkingDir: '/workspace',
    Env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
    NetworkDisabled: false,
  });
  await container.start();
  const stream = await container.logs({ stdout: true, stderr: true, follow: true });
  return { container, stream };
}

export async function stopContainer(containerId) {
  try {
    const c = docker.getContainer(containerId);
    await c.stop({ t: 5 });
  } catch {}
}

export async function listRunning() {
  return docker.listContainers({ filters: { label: ['studio=virallinkup'] } });
}

export default docker;
