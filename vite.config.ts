import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Dokumen yang ditautkan dari aplikasi (Pengaturan, footer) ikut disalin ke dist/.
const LINKED_DOCS = ['docs/privasi.md', 'docs/schema.sql'];

function linkedDocs(): Plugin {
  return {
    name: 'rm-linked-docs',
    apply: 'build',
    generateBundle() {
      for (const file of LINKED_DOCS) this.emitFile({ type: 'asset', fileName: file, source: readFileSync(file) });
    }
  };
}

// CSP di <meta> memakai connect-src 'none'. Saat dev saja, izinkan websocket HMR Vite.
function devCsp(): Plugin {
  return {
    name: 'rm-dev-csp',
    apply: 'serve',
    transformIndexHtml: (html) => html.replace("connect-src 'none'", "connect-src 'self' ws: wss:")
  };
}

export default defineConfig({
  base: './',
  plugins: [linkedDocs(), devCsp()],
  build: {
    rollupOptions: {
      input: {
        app: 'index.html',
        profil: 'profil.html',
        tests: 'tests.html'
      }
    }
  },
  test: { include: ['src/**/*.test.ts'] }
});
