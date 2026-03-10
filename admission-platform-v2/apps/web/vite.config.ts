import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';

export default defineConfig({
  base: '/',
  build: {
    outDir: '../../../dist',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
          dest: 'assets'
        },
        {
          src: '../../../italiano',
          dest: ''
        },
        {
          src: '../../../inglese',
          dest: ''
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@admission/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  optimizeDeps: {
    include: [
      '@lezer/highlight',
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/language',
      '@codemirror/lang-markdown',
      '@uiw/react-codemirror',
    ],
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from the parent project root (for italiano/inglese folders)
      allow: ['..', '../..', '../../..'],
    },
  },
  configureServer(server) {
    // Serve italiano and inglese folders from project root during dev
    server.middlewares.use((req, res, next) => {
      if (req.url?.startsWith('/italiano/') || req.url?.startsWith('/inglese/')) {
        const filePath = path.join(__dirname, '../../..', req.url);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          return res.end(fs.readFileSync(filePath));
        }
      }
      next();
    });
  },
});
