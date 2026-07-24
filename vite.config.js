import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        wave: resolve(__dirname, 'wave.html'),
        calibrate: resolve(__dirname, 'calibrate.html'),
      },
    },
  },
})
