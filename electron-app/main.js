const { app, BrowserWindow, dialog } = require('electron');
const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const treeKill = require('tree-kill');

// Track running processes
let mainWindow = null;
let loadingWindow = null;
const processes = {};

// Ports
const PORTS = { nextjs: 3006, worker: 8787, proxy: 3001 };

// User data directory (writable)
const USER_DATA_DIR = path.join(app.getPath('userData'), 'foxstream-app');

function log(msg) {
  console.log(`[FoxStream] ${new Date().toISOString()} - ${msg}`);
}

// Get full PATH including common Node.js locations
function getEnhancedPath() {
  const home = process.env.HOME || '';
  const additionalPaths = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    `${home}/.nvm/versions/node/v20.19.5/bin`,
    `${home}/.nvm/versions/node/v18.20.0/bin`,
    `${home}/.nvm/versions/node/v22.12.0/bin`,
    `${home}/.volta/bin`,
    `${home}/.fnm/current/bin`,
    `${home}/.local/bin`,
    '/usr/bin',
    '/bin'
  ];

  const currentPath = process.env.PATH || '';
  return [...additionalPaths, ...currentPath.split(':')].join(':');
}

// Get bundled app source
function getBundledAppPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app');
  }
  return path.join(__dirname, '..');
}

// Copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules, .next, .git
    if (['node_modules', '.next', '.git', 'dist', 'electron-app'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Get enhanced environment
function getEnhancedEnv(extra = {}) {
  return {
    ...process.env,
    PATH: getEnhancedPath(),
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    ...extra
  };
}

// Setup app in user directory
async function setupAppDirectory() {
  const bundledPath = getBundledAppPath();
  const versionFile = path.join(USER_DATA_DIR, '.version');
  const currentVersion = '1.0.0';

  // Check if we need to copy/update
  let needsCopy = !fs.existsSync(USER_DATA_DIR);

  if (!needsCopy && fs.existsSync(versionFile)) {
    const installedVersion = fs.readFileSync(versionFile, 'utf8').trim();
    needsCopy = installedVersion !== currentVersion;
  }

  if (needsCopy) {
    log(`Setting up FoxStream in ${USER_DATA_DIR}...`);
    updateLoadingStatus('Copying app files...');

    // Remove old version if exists
    if (fs.existsSync(USER_DATA_DIR)) {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    }

    // Copy app files
    copyDirSync(bundledPath, USER_DATA_DIR);

    // Write version file
    fs.writeFileSync(versionFile, currentVersion);

    log('App files copied');
  }

  return USER_DATA_DIR;
}

// Install dependencies
async function installDependencies(dir, name) {
  const nodeModules = path.join(dir, 'node_modules');

  if (!fs.existsSync(nodeModules)) {
    log(`Installing ${name} dependencies...`);
    updateLoadingStatus(`Installing ${name} dependencies (this may take a few minutes)...`);

    return new Promise((resolve, reject) => {
      const proc = exec('npm install --legacy-peer-deps', {
        cwd: dir,
        timeout: 600000,
        env: getEnhancedEnv()
      }, (err, stdout, stderr) => {
        if (err) {
          log(`Install error for ${name}: ${stderr}`);
          log(`stdout: ${stdout}`);
          reject(err);
        } else {
          log(`${name} dependencies installed`);
          resolve();
        }
      });

      // Log output in real-time
      proc.stdout?.on('data', (d) => log(`[npm] ${d.toString().trim()}`));
      proc.stderr?.on('data', (d) => log(`[npm:err] ${d.toString().trim()}`));
    });
  } else {
    log(`${name} dependencies already installed`);
  }
}

// Wait for port
function waitForPort(port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const net = require('net');
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Port ${port} timeout`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.connect(port, 'localhost');
    };
    check();
  });
}

// Start service
function startService(name, cmd, args, cwd, env = {}) {
  log(`Starting ${name}...`);
  updateLoadingStatus(`Starting ${name}...`);

  const proc = spawn(cmd, args, {
    cwd,
    env: getEnhancedEnv(env),
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  processes[name] = proc;

  proc.stdout?.on('data', (d) => log(`[${name}] ${d.toString().trim()}`));
  proc.stderr?.on('data', (d) => log(`[${name}:err] ${d.toString().trim()}`));
  proc.on('error', (e) => log(`[${name}] Error: ${e.message}`));
  proc.on('close', (code) => {
    log(`[${name}] Exited (${code})`);
    processes[name] = null;
  });

  return proc;
}

// Stop all services
async function stopAll() {
  log('Stopping all services...');
  for (const [name, proc] of Object.entries(processes)) {
    if (proc?.pid) {
      log(`Stopping ${name}...`);
      try {
        treeKill(proc.pid, 'SIGTERM');
      } catch (e) {
        log(`Error stopping ${name}: ${e.message}`);
      }
    }
  }
}

// Update loading window status
function updateLoadingStatus(status) {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.webContents.executeJavaScript(
      `document.querySelector('.status').textContent = '${status}';`
    ).catch(() => {});
  }
}

// Start all services
async function startAllServices() {
  try {
    // Setup app in user directory
    const appDir = await setupAppDirectory();
    log(`App directory: ${appDir}`);

    // Install main dependencies
    await installDependencies(appDir, 'FoxStream');

    // Start proxy
    const proxyDir = path.join(appDir, 'rpi-proxy');
    if (fs.existsSync(proxyDir)) {
      await installDependencies(proxyDir, 'Proxy');
      startService('proxy', 'node', ['server.js'], proxyDir, {
        PORT: PORTS.proxy,
        API_KEY: 'foxstream-local'
      });
      await waitForPort(PORTS.proxy, 30000).catch((e) => log(`Proxy timeout: ${e.message}`));
    }

    // Start worker
    const workerDir = path.join(appDir, 'cloudflare-proxy');
    if (fs.existsSync(workerDir)) {
      await installDependencies(workerDir, 'Worker');
      startService('worker', 'npx', [
        'wrangler', 'dev', '--local', '--port', PORTS.worker.toString()
      ], workerDir);
      await waitForPort(PORTS.worker, 45000).catch((e) => log(`Worker timeout: ${e.message}`));
    }

    // Start Next.js
    updateLoadingStatus('Starting FoxStream...');
    startService('nextjs', 'npm', ['run', 'dev'], appDir, { PORT: PORTS.nextjs });
    await waitForPort(PORTS.nextjs, 90000);

    log('All services started!');
    return true;
  } catch (err) {
    log(`Startup error: ${err.message}`);
    console.error(err);
    return false;
  }
}

// Create loading window
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 500,
    height: 400,
    frame: false,
    transparent: false,
    backgroundColor: '#0f0f23',
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  loadingWindow.loadFile(path.join(__dirname, 'loading.html'));
  loadingWindow.show();
}

// Create main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'FoxStream',
    backgroundColor: '#0f0f23',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadURL(`http://localhost:${PORTS.nextjs}`);

  mainWindow.once('ready-to-show', () => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close();
    }
    mainWindow.show();
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// App ready
app.whenReady().then(async () => {
  log('Starting FoxStream...');
  log(`PATH: ${getEnhancedPath()}`);

  createLoadingWindow();

  const success = await startAllServices();

  if (success) {
    createMainWindow();
  } else {
    dialog.showErrorBox('FoxStream Error',
      'Failed to start services.\n\n' +
      'Make sure you have Node.js installed:\n' +
      'https://nodejs.org/\n\n' +
      `Logs: ${app.getPath('userData')}`
    );
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await stopAll();
  app.quit();
});

app.on('before-quit', async () => {
  await stopAll();
});

process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
  console.error(err);
});
