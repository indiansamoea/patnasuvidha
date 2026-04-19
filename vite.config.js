import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    outDir: 'dist',
    commonjsOptions: {
      ignore: ['firebase-admin', 'jsonwebtoken']
    },
    rollupOptions: {
      external: ['api/**', 'functions/**'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('@phosphor-icons')) return 'vendor-icons';
            if (id.includes('react')) return 'vendor-react-core';
            return 'vendor-others';
          }
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['firebase-admin', 'jsonwebtoken']
  }
})
