import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_PORT': JSON.stringify(process.env.VITE_PORT),
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_DEBUG': JSON.stringify(process.env.VITE_DEBUG)
  },
  server: {
    port: process.env.VITE_PORT || 3000,
    cors: {
      origin: [
        'https://d1-live.emerson.com',
        'https://s1-live.emerson.com',
        'https://emerson.com',
        'https://prvpa-reports-dev.emerson.com',
        'https://prvpa-reports-stage.emerson.com',
        'https://prvpa-reports.emerson.com'
      ]
    }
  },
  preview: {
    allowedHosts: [
      'prvpa-reports-dev.emerson.com',
      'prvpa-reports-stage.emerson.com',
      'prvpa-reports.emerson.com'
    ]
  },
  build: {
    external: ["emitter"],
    rollupOptions: {
      // always throw with build warnings
      onwarn (warning, warn) {
        console.log({warning});
        warn('\nBuild warning happened, customize "onwarn" callback in vite.config.js to handle this error.');
        throw new Error(warning);
      },
    }
  }
})
