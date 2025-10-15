// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://kopmaukmunnes.com',
  base: '/',
  
  // Integrations
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: true,
      config: {
        path: './tailwind.config.mjs'
      }
    }),
  ],
  
  // Output configuration
  output: 'static',
  
  // Build configuration
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  
  // Vite configuration
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'framer-motion': ['framer-motion'],
            'ui-components': ['@tinymce/tinymce-react', 'react-dropzone'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion'],
    },
  },
  
  // Server configuration
  server: {
    port: 4321,
    host: true,
  },
  
  // Image optimization
  image: {
    domains: ['kopmaukmunnes.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.kopmaukmunnes.com',
      },
    ],
  },
  
  // Markdown configuration
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});