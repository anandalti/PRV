import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const browserEnv = Object.fromEntries(Object.entries(env).filter(([key]) =>
    /^(VITE_|REACT_APP_|DISPLAY_|MULTIVALVE_|FORM_FIELDS_COLUMNS$|PAGINATION_FLAG$)/.test(key)
  ));
  browserEnv.NODE_ENV = process.env.NODE_ENV || (mode === 'production' ? 'production' : 'development');
  return {
  plugins: [react()],
  define: {
    'process.env': browserEnv
  },
  server: {
    port: 3000,
    cors: {
      origin: [
        'https://d1-live.emerson.com',
        'https://s1-live.emerson.com',
        'https://www.emerson.com',
        'https://emerson.com',
        'https://prvpa-sizing-dev.emerson.com',
        'https://prvpa-sizing-stage.emerson.com',
        'https://prvpa-sizing.emerson.com'
      ]
    }
  },
  preview: {
    allowedHosts: [
      'prvpa-sizing-dev.emerson.com',
      'prvpa-sizing-stage.emerson.com',
      'prvpa-sizing.emerson.com'
    ],
  },
  build: {
    external: ['emitter'],
    rollupOptions: {
      onwarn (warning, warn) {
        // console.log({warning});
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('node_modules')) return;
        warn('\nBuild warning happened, customize "onwarn" callback in vite.config.js to handle this error.');
        throw new Error(warning);
      },
    }
  }
  };
})
