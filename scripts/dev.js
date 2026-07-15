const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const isWindows = process.platform === 'win32';

function logBackend(message) {
  console.log(`${colors.blue}[Backend]${colors.reset} ${message}`);
}

function logFrontend(message) {
  console.log(`${colors.green}[Frontend]${colors.reset} ${message}`);
}

function logMain(message) {
  console.log(`${colors.yellow}[Main]${colors.reset} ${message}`);
}

logMain('Starting backend and frontend servers...\n');

// Start backend
const backendProcess = spawn('npm', ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd(),
});

backendProcess.on('error', (err) => {
  logBackend(`Error: ${err.message}`);
  process.exit(1);
});

// Start frontend with a slight delay
setTimeout(() => {
  const frontendProcess = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
  });

  frontendProcess.on('error', (err) => {
    logFrontend(`Error: ${err.message}`);
    process.exit(1);
  });

  // Handle exit
  process.on('SIGINT', () => {
    logMain('Shutting down...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
}, 1000);
