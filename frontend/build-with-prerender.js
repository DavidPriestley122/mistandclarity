import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildWithPrerender() {
  console.log('🚀 Starting server for prerendering...');

  // Start the server
  const server = spawn('npx', ['serve', '-s', 'dist', '-l', '8080'], {
    stdio: 'pipe',
    shell: true
  });

  // Wait for server to be ready
  await new Promise((resolve) => {
    let started = false;

    server.stdout.on('data', (data) => {
      if (!started && data.toString().includes('Accepting connections')) {
        started = true;
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    // Fallback timeout
    setTimeout(() => {
      if (!started) {
        console.log('Server started (timeout fallback)');
        resolve();
      }
    }, 5000);
  });

  console.log('✅ Server ready');

  // Run prerendering
  const prerender = spawn('node', ['prerender.js'], {
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve, reject) => {
    prerender.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prerender failed with code ${code}`));
      }
    });
  });

  // Stop the server
  console.log('🛑 Stopping server...');
  server.kill();

  console.log('✨ Build with prerendering complete!');
}

buildWithPrerender().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
