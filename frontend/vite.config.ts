import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET?.trim();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('react-router')) {
              return 'router-vendor';
            }

            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }

            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }

            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }

            if (id.includes('date-fns')) {
              return 'date-vendor';
            }

            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-vendor';
            }

            return 'vendor';
          },
        },
      },
    },
    test: {
      environment: 'happy-dom',
      setupFiles: './src/test/setup.ts',
      globals: false,
    },
  };
})
