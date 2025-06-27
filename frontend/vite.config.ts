import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer for production builds
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    // Performance optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-charts': ['recharts'],
          'vendor-router': ['react-router-dom'],
          'vendor-utils': ['axios', 'date-fns'],
          
          // Feature chunks
          'dashboard': [
            './src/components/dashboard/MainDashboard.tsx',
            './src/components/dashboard/EnhancedDashboard.tsx',
            './src/components/dashboard/SalesChart.tsx',
            './src/components/dashboard/ProductPerformance.tsx',
            './src/components/dashboard/CustomerEngagement.tsx',
            './src/components/dashboard/IntegrationStatus.tsx',
            './src/components/dashboard/ActivityFeed.tsx',
          ],
          'frame-finder': [
            './src/components/frame-finder/FrameSelector.tsx',
            './src/components/frame-finder/FrameComparison.tsx',
            './src/components/frame-finder/FilterSortControls.tsx',
            './src/components/frame-finder/FaceShapeSelector.tsx',
            './src/components/frame-finder/FeatureTagSelector.tsx',
            './src/components/frame-finder/EnhancedRecommendationCard.tsx',
          ],
          'virtual-try-on': [
            './src/components/virtual-try-on/FrameSelector.tsx',
          ],
          'settings': [
            './src/components/settings/FormSection.tsx',
            './src/components/settings/ToggleSwitch.tsx',
            './src/components/settings/ApiKeyManager.tsx',
            './src/components/settings/ColorPicker.tsx',
          ],
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts',
      'react-router-dom',
      'axios',
    ],
  },
})
