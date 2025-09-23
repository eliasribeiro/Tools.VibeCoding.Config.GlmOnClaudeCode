const { spawn } = require('child_process');

console.log('🚀 Starting GLM AI Config development environment...');

// Start React development server
console.log('⚛️  Starting React development server...');
const reactProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

reactProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('webpack compiled') || output.includes('Local:') || output.includes('compiled successfully')) {
    console.log('[React]', output.trim());
  }
});

reactProcess.stderr.on('data', (data) => {
  const output = data.toString().trim();
  if (output && !output.includes('DeprecationWarning')) {
    console.log('[React]', output);
  }
});

// Wait for React server to start, then launch Electron
setTimeout(() => {
  console.log('🔧 Starting Electron...');
  const electronProcess = spawn('electron', ['.'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, ELECTRON_IS_DEV: 'true' }
  });

  electronProcess.stdout.on('data', (data) => {
    console.log('[Electron]', data.toString().trim());
  });

  electronProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output && !output.includes('DeprecationWarning') && !output.includes('ExtensionLoadWarning')) {
      console.log('[Electron]', output);
    }
  });

  electronProcess.on('close', (code) => {
    console.log('🔧 Electron process ended');
    reactProcess.kill();
    process.exit(code);
  });
}, 8000); // Increased wait time for React to fully start

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  reactProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development environment...');
  reactProcess.kill();
  process.exit(0);
});