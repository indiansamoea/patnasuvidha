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
        manualChunks: {
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/messaging'],
          'vendor-ui': ['framer-motion', '@phosphor-icons/react', 'react-router-dom'],
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['firebase-admin', 'jsonwebtoken']
  }
})
