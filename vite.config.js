import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Bump this number ONLY when localStorage schema changes in a backward-incompatible way.
// Incrementing this will clear transient keys on first load after deploy.
const APP_DATA_VERSION = 1;

function swCacheVersionPlugin() {
  return {
    name: 'sw-cache-version',
    closeBundle() {
      const swPath = resolve(__dirname, 'dist/sw.js');
      try {
        let content = readFileSync(swPath, 'utf-8');
        const cacheId = `k8s-quest-${Date.now()}`;
        content = content.replace('__SW_CACHE_VERSION__', cacheId);
        writeFileSync(swPath, content, 'utf-8');
        console.log(`[sw-cache-version] Stamped SW cache: ${cacheId}`);
      } catch (e) {
        console.warn('[sw-cache-version] Could not stamp sw.js:', e.message);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), swCacheVersionPlugin()],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_DATA_VERSION__: APP_DATA_VERSION,
  },
})
