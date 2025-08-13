import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
    plugins: [
      react({
        // Enable Fast Refresh for development
        fastRefresh: isDevelopment,
        // Optimize dependencies
        include: "**/*.{jsx,tsx}",
        // JSX optimization for production
        jsxRuntime: 'automatic',
        babel: {
          plugins: isProduction ? [
            ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
          ] : []
        }
      }),
      
      // PWA Configuration
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  return `${request.url}?v=1`
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Raleskip Portfolio - Aayush Pawar',
          short_name: 'Raleskip',
          description: 'Digital Marketing Expert & AI Innovation Leader Portfolio',
          theme_color: '#10b981',
          background_color: '#000000',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait-primary',
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable any'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable any'
            }
          ]
        },
        devOptions: {
          enabled: false
        }
      }),
      
      // Bundle analyzer for production builds
      isProduction && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ].filter(Boolean),
    
    // Production optimizations
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps for debugging (disabled in production)
      sourcemap: isDevelopment ? true : false,
      
      // Minification
      minify: isProduction ? 'terser' : 'esbuild',
      
      // Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      } : {},
      
      // Target modern browsers for smaller bundles
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
      
      // Rollup options for advanced bundling
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          // Manual chunks for better caching and loading
          manualChunks: (id) => {
            // Vendor chunk for React and core libraries
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react'
            }
            // Motion library separate chunk
            if (id.includes('node_modules/motion') || id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            // UI components chunk
            if (id.includes('node_modules/sonner') || id.includes('node_modules/lucide-react')) {
              return 'vendor-ui'
            }
            // Chart library separate chunk
            if (id.includes('node_modules/recharts')) {
              return 'vendor-charts'
            }
            // Form library
            if (id.includes('node_modules/react-hook-form')) {
              return 'vendor-forms'
            }
            // Other vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor-misc'
            }
          },
          // Optimize chunk file names with content hashing
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name
            return `assets/js/${name}-[hash].js`
          },
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`
            }
            if (/woff|woff2|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        },
        external: (id) => {
          // Externalize Google Analytics and other external scripts
          return /^https?:\/\//.test(id)
        }
      },
      
      // Chunk size warnings (increased for production builds)
      chunkSizeWarningLimit: isProduction ? 1500 : 1000,
      
      // Asset size warnings (inline small assets)
      assetsInlineLimit: 4096,
      
      // CSS code splitting for better caching
      cssCodeSplit: true,
      
      // Reports bundle size in production
      reportCompressedSize: isProduction,
      
      // Compression
      compress: isProduction,
      
      // Write bundle info
      write: true,
      
      // Empty out dir on build
      emptyOutDir: true,
      
      // Copy public directory
      copyPublicDir: true
    },
    
    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      strictPort: false,
      hmr: {
        overlay: true,
        port: 3001
      },
      // CORS configuration for development
      cors: true,
      // Proxy configuration if needed
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      open: true,
      strictPort: false,
      cors: true
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
        '@components': resolve(__dirname, './components'),
        '@styles': resolve(__dirname, './styles'),
        '@assets': resolve(__dirname, './assets'),
        '@public': resolve(__dirname, './public'),
        '@imports': resolve(__dirname, './imports')
      }
    },
    
    // CSS configuration
    css: {
      // PostCSS configuration
      postcss: {
        plugins: []
      },
      // CSS modules
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction 
          ? '[hash:base64:5]' 
          : '[name]__[local]___[hash:base64:5]'
      },
      // CSS preprocessing
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss";`
        }
      },
      // CSS devSourcemap for development
      devSourcemap: isDevelopment
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'motion/react',
        'sonner',
        'lucide-react',
        'recharts',
        'react-hook-form'
      ],
      exclude: [
        '@vite/client',
        '@vite/env'
      ],
      // Force dependency optimization
      force: false
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __PROD__: JSON.stringify(isProduction),
      __DEV__: JSON.stringify(isDevelopment),
      // Global feature flags
      __ENABLE_ANALYTICS__: JSON.stringify(isProduction),
      __ENABLE_PWA__: JSON.stringify(isProduction)
    },
    
    // Public base path
    base: '/',
    
    // Asset handling
    assetsInclude: [
      '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', 
      '**/*.svg', '**/*.webp', '**/*.avif', '**/*.ico',
      '**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.otf'
    ],
    
    // Worker configuration
    worker: {
      format: 'es',
      plugins: []
    },
    
    // JSON configuration
    json: {
      stringify: true
    },
    
    // ESBuild configuration
    esbuild: {
      // Remove console logs in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // Target modern syntax
      target: 'es2020',
      // Minimize whitespace
      minifyWhitespace: isProduction,
      // Minimize identifiers
      minifyIdentifiers: isProduction,
      // Minimize syntax
      minifySyntax: isProduction
    },
    
    // Log level
    logLevel: isDevelopment ? 'info' : 'warn',
    
    // Clear screen
    clearScreen: true
  }
})