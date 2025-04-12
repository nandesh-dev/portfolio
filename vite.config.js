import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'web',
  server: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        journey: resolve(__dirname, 'web/journey/index.html'),
      },
    },
  },
})
