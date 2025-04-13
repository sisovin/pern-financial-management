import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

console.log('Waiting for server to start...');

// Watch for the server-urls.txt file to be created or updated
fs.watchFile('server-urls.txt', { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    // Find tsx using a more robust approach
    let command = 'tsx';
    let args = ['./scripts/show-urls.ts'];
    
    // For Windows, use the .cmd extension
    if (process.platform === 'win32') {
      // Try to use npx to run tsx
      command = 'npx';
      args = ['tsx', './scripts/show-urls.ts'];
    }
    
    console.log(`Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { 
      stdio: 'inherit',
      shell: true // This helps on Windows
    });
    
    child.on('error', (err) => {
      console.error('Failed to start command:', err);
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Error: show-urls script exited with code ${code}`);
      }
    });
  }
});