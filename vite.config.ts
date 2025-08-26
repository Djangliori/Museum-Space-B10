import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't delete API directory
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        booking: resolve(__dirname, 'simple-booking.html'),
        success: resolve(__dirname, 'payment-success.html'),
        cancel: resolve(__dirname, 'payment-cancel.html'),
        terms: resolve(__dirname, 'terms.html'),
        test: resolve(__dirname, 'test-unipay.html')
      },
      // Exclude API files from bundling (let Vercel handle them)
      external: ['api/*']
    },
    // Ensure API directory is preserved
    copyPublicDir: true
  },
  
  // Development server
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/styles': resolve(__dirname, 'src/styles'),
      '@/ts': resolve(__dirname, 'src/ts')
    }
  },
  
  // CSS processing
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Public directory
  publicDir: 'public',
  
  // Vercel compatibility
  base: '/',
  
  // Plugins for future extensibility
  plugins: [],
  
  // Define globals for better compatibility
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})