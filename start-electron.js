const { spawn } = require('child_process');
const path = require('path');

// Wait 5 seconds for Vite dev server to start
setTimeout(() => {
  console.log('Starting Electron...');
  
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd');
  const electron = spawn(electronPath, ['.'], {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  electron.on('exit', (code) => {
    console.log(`Electron exited with code ${code}`);
    process.exit(code);
  });

  electron.on('error', (err) => {
    console.error('Failed to start Electron:', err);
    process.exit(1);
  });
}, 5000);
