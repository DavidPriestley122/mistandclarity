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
    shell: true,
    detached: false
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

  let exitCode = 0;
  try {
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
          exitCode = code;
          reject(new Error(`Prerender failed with code ${code}`));
        }
      });
    });
  } finally {
    // Always stop the server, even if prerender failed
    console.log('🛑 Stopping server...');
    server.kill('SIGTERM');

    // Force kill after 2 seconds if still running
    setTimeout(() => {
      if (!server.killed) {
        console.log('Force killing server...');
        server.kill('SIGKILL');
      }
    }, 2000);

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✨ Build with prerendering complete!');

  // Exit the process explicitly
  process.exit(exitCode);
}

buildWithPrerender().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
