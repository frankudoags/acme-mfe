import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const remotes = {
  header: process.env.HEADER_REMOTE || 'http://localhost:5001/assets/remoteEntry.js',
  products: process.env.PRODUCTS_REMOTE || 'http://localhost:5002/assets/remoteEntry.js',
  cart: process.env.CART_REMOTE || 'http://localhost:5003/assets/remoteEntry.js',
}

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes,
      shared: ['react', 'react-dom', '@acme/packages', '@tanstack/react-query', 'zustand'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
