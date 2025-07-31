import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      'devserver-main--meek-marshmallow-d320f9.netlify.app'
    ]
  },
  plugins: [vue()],
  mode: 'production'
})
