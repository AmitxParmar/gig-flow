import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    devtools(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core'
          }

          // TanStack libraries
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack'
          }

          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'ui-libs'
          }

          // Form handling libraries
          if (id.includes('node_modules/react-hook-form') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules/@hookform/resolvers')) {
            return 'forms'
          }

          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }

          // Real-time communication
          if (id.includes('node_modules/socket.io-client')) {
            return 'realtime'
          }

          // Utility libraries
          if (id.includes('node_modules/date-fns') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge') ||
            id.includes('node_modules/class-variance-authority') ||
            id.includes('node_modules/axios')) {
            return 'utils'
          }
        },
      },
    },
  },
})

