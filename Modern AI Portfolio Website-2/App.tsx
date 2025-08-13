import React, { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Toaster } from './components/ui/sonner'
import { toast } from 'sonner@2.0.3'
import raleskipLogo from 'figma:asset/a78476f907be19392ee6d9e24f5f23a82b9a29ea.png'

// Global type declarations
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
  
  // Build-time constants
  const __BUILD_DATE__: string
}

// Safe environment variables with proper fallbacks
const getEnvVar = (key: string, defaultValue: string = '') => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue
    }
    return defaultValue
  } catch {
    return defaultValue
  }
}

const getBooleanEnvVar = (key: string, defaultValue: boolean = false) => {
  try {
    const value = getEnvVar(key, '')
    return value === 'true'
  } catch {
    return defaultValue
  }
}

// Safe way to check environment
const isDevEnvironment = () => {
  try {
    return import.meta.env?.DEV === true
  } catch {
    return typeof window !== 'undefined' && window.location.hostname === 'localhost'
  }
}

const isProdEnvironment = () => {
  try {
    return import.meta.env?.PROD === true
  } catch {
    return typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  }
}

const ENV = {
  isDevelopment: isDevEnvironment(),
  isProduction: isProdEnvironment(),
  siteUrl: getEnvVar('VITE_SITE_URL', 'https://www.raleskip.com'),
  siteName: getEnvVar('VITE_SITE_NAME', 'Raleskip Portfolio'),
  contactEmail: getEnvVar('VITE_CONTACT_EMAIL', 'contact@raleskip.com'),
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  enablePWA: getBooleanEnvVar('VITE_ENABLE_PWA', false),
  enableServiceWorker: getBooleanEnvVar('VITE_ENABLE_SERVICE_WORKER', false),
  gaId: getEnvVar('VITE_GA_MEASUREMENT_ID', ''),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  buildDate: (() => {
    try {
      return typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString()
    } catch {
      return new Date().toISOString()
    }
  })(),
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', false),
  consoleLogs: getBooleanEnvVar('VITE_CONSOLE_LOGS', false)
}

// Auto-detect environment if not explicitly set
if (!ENV.isDevelopment && !ENV.isProduction) {
  ENV.isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ENV.isProduction = !ENV.isDevelopment
}

// Conditional logging
const log = (...args: any[]) => {
  if (ENV.consoleLogs || ENV.isDevelopment) {
    console.log(...args)
  }
}

const logError = (...args: any[]) => {
  console.error(...args)
}

// Performance-optimized lazy loading with preloading hints
const Skills = lazy(() => 
  import('./components/Skills').then(module => ({ default: module.Skills }))
)
const ProfessionalJourney = lazy(() => 
  import('./components/ProfessionalJourney').then(module => ({ default: module.ProfessionalJourney }))
)
const ProjectsPage = lazy(() => 
  import('./components/ProjectsPage').then(module => ({ default: module.ProjectsPage }))
)
const ContactPage = lazy(() => 
  import('./components/ContactPage').then(module => ({ default: module.ContactPage }))
)

type Page = 'home' | 'about' | 'skills' | 'journey' | 'projects' | 'contact'

// Production Analytics Interface
interface AnalyticsEvent {
  event: string
  page?: string
  section?: string
  action?: string
  duration?: number
  timestamp: number
  sessionId: string
  userId?: string
}

// Enhanced Performance Monitoring
class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()
  private sessionId: string
  private performanceEntries: PerformanceEntry[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializePerformanceObserver()
    this.initializeMemoryMonitoring()
  }

  private generateSessionId(): string {
    try {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
      }
      return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
    } catch {
      return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.performanceEntries.push(entry)
          this.metrics.set(entry.name, entry.startTime)
          
          if (ENV.isProduction && ENV.enableAnalytics) {
            this.reportMetric(entry.name, entry.startTime)
          }
          
          if (entry.duration > 100 && ENV.isDevelopment) {
            console.warn(`[Performance] Slow operation detected: ${entry.name} (${entry.duration}ms)`)
          }
        })
      })
      
      observer.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      })
      
      log('[Performance] Observer initialized successfully')
    } catch (error) {
      logError('[Performance] Observer not supported:', error)
    }
  }

  private initializeMemoryMonitoring() {
    if (typeof performance !== 'undefined' && 'memory' in performance && ENV.isDevelopment) {
      const checkMemory = () => {
        try {
          const memInfo = (performance as any).memory
          const usagePercent = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100
          
          this.metrics.set('memoryUsage', usagePercent)
          
          if (usagePercent > 80) {
            console.warn(`[Performance] High memory usage: ${usagePercent.toFixed(1)}%`)
          }
        } catch (error) {
          // Memory API not available
        }
      }
      
      checkMemory()
      setInterval(checkMemory, 30000)
    }
  }

  private reportMetric(name: string, value: number) {
    if (ENV.isProduction && ENV.enableAnalytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        custom_parameter_1: name,
        custom_parameter_2: value,
        session_id: this.sessionId
      })
    }
    
    log(`[Performance] ${name}: ${value}ms`)
  }

  trackPageLoad(page: string) {
    const startTime = Date.now()
    return () => {
      const duration = Date.now() - startTime
      this.metrics.set(`page_load_${page}`, duration)
      this.reportMetric(`page_load_${page}`, duration)
      
      if (ENV.enableAnalytics && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_load_time', {
          page_name: page,
          load_time: duration,
          session_id: this.sessionId
        })
      }
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  getSessionId(): string {
    return this.sessionId
  }

  getCoreWebVitals(): Record<string, number> {
    const vitals: Record<string, number> = {}
    
    this.performanceEntries.forEach(entry => {
      if (entry.entryType === 'largest-contentful-paint') {
        vitals.LCP = entry.startTime
      }
      if (entry.entryType === 'first-input') {
        vitals.FID = (entry as any).processingStart - entry.startTime
      }
      if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
        vitals.CLS = (vitals.CLS || 0) + (entry as any).value
      }
    })
    
    return vitals
  }
}

// Enhanced Error Boundary Component
class ProductionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{error: Error, retry: () => void}> },
  { hasError: boolean; error: Error | null; errorId: string; retryCount: number }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null, errorId: '', retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { 
      hasError: true, 
      error, 
      errorId: 'error-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (ENV.isProduction) {
      this.reportError(error, errorInfo)
    }
    
    logError('[Error Boundary] Caught error:', error, errorInfo)
  }

  reportError(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
      sessionId: PerformanceMonitor.getInstance().getSessionId(),
      retryCount: this.state.retryCount
    }
    
    if (ENV.enableAnalytics && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true,
        error_id: this.state.errorId
      })
    }
    
    log('[Error Report]:', errorReport)
  }

  retry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorId: '', 
      retryCount: prevState.retryCount + 1 
    }))
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} retry={this.retry} />
    }

    return this.props.children
  }
}

// Enhanced Error Fallback with Recovery Options
const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
    <div className="text-center max-w-md space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        
        <h2 className="text-2xl font-display font-bold">Something went wrong</h2>
        <p className="text-white/70">We encountered an unexpected error while loading your portfolio.</p>
        
        <div className="space-y-3">
          <button
            onClick={retry}
            className="neuro-btn px-6 py-3 mr-3"
          >
            Try Again
          </button>
          
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="neuro-btn px-6 py-3 bg-gray-700 hover:bg-gray-600"
          >
            Reload Page
          </button>
        </div>

        {ENV.isDevelopment && (
          <details className="mt-4 text-left text-xs opacity-50 max-w-sm mx-auto">
            <summary className="cursor-pointer">Technical Details</summary>
            <pre className="mt-2 whitespace-pre-wrap p-3 bg-gray-800 rounded text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </motion.div>
    </div>
  </div>
)

// Enhanced Loading Component with Progressive Loading
const ProductionPageLoader = ({ stage }: { stage?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <motion.div
      className="relative w-12 h-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-2 border-2 border-purple-500 border-b-transparent rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
    
    {stage && (
      <motion.p
        className="text-sm text-white/60 font-mono"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {stage}
      </motion.p>
    )}
  </div>
)

// Production-Ready App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState<string>('Initializing...')
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [performanceMonitor] = useState(() => PerformanceMonitor.getInstance())
  const [sessionStartTime] = useState(Date.now())
  const shouldReduceMotion = useReducedMotion()

  // Enhanced SEO and Meta Management
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    document.title = `${ENV.siteName} | Digital Marketing Expert & AI Innovation Leader`
    
    const metaTags = [
      { name: 'description', content: 'Aayush Pawar - Digital First Marketer, AI Specialist & Creative Visionary at Raleskip. 9+ years expertise in healthcare marketing, brand campaigns, and technology innovation. Currently Product Marketing Manager at Jio Platforms Limited.' },
      { name: 'keywords', content: 'Aayush Pawar, Raleskip, Digital Marketing Expert, AI Marketing, Healthcare Marketing, Product Marketing Manager, Jio Platforms, JioHealthHub, Brand Strategy, Creative Direction, Marketing Technology, UX/UI Design, Digital Innovation' },
      { name: 'author', content: 'Aayush Pawar' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'theme-color', content: '#10b981' },
      { property: 'og:title', content: 'Aayush Pawar | Digital Marketing Expert & AI Innovation Leader | Raleskip' },
      { property: 'og:description', content: 'Digital First Marketer, AI Specialist & Creative Visionary with 9+ years expertise in healthcare marketing, brand campaigns, and technology innovation at Jio Platforms Limited.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: ENV.siteUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Aayush Pawar | Digital Marketing Expert & AI Innovation Leader' },
      { name: 'version', content: ENV.appVersion },
      { name: 'build-date', content: ENV.buildDate },
    ]

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`
      
      let existingTag = document.querySelector(selector)
      
      if (existingTag) {
        existingTag.setAttribute('content', content)
      } else {
        const meta = document.createElement('meta')
        if (name) meta.name = name
        if (property) meta.setAttribute('property', property)
        meta.content = content
        document.head.appendChild(meta)
      }
    })

    log('[SEO] Meta tags initialized')
  }, [])

  // Google Analytics 4 Initialization
  useEffect(() => {
    if (ENV.enableAnalytics && ENV.gaId && ENV.isProduction && typeof document !== 'undefined') {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ENV.gaId}`
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', ENV.gaId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: false
      })

      log('[Analytics] Google Analytics 4 initialized')
    }
  }, [])

  // Performance-optimized particle generation
  const backgroundParticles = useMemo(() => {
    if (typeof window === 'undefined') return []
    
    const getParticleCount = () => {
      if (shouldReduceMotion) return 0
      if (window.innerWidth < 768) return 6
      if (window.innerWidth < 1200) return 10
      return 14
    }
    
    return Array.from({ length: getParticleCount() }, (_, i) => ({
      id: `particle-${i}-${Date.now()}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
      color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'][Math.floor(Math.random() * 4)]
    }))
  }, [shouldReduceMotion])

  // Enhanced network monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored', { 
        duration: 2000,
        description: 'All features are now available'
      })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Connection lost', { 
        duration: 4000,
        description: 'Some features may be limited'
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Production-ready loading simulation
  const loadingStages = [
    { stage: 'Initializing Raleskip Experience...', progress: 0 },
    { stage: 'Loading core assets...', progress: 20 },
    { stage: 'Preparing portfolio data...', progress: 40 },
    { stage: 'Setting up interactive elements...', progress: 60 },
    { stage: 'Optimizing performance...', progress: 80 },
    { stage: 'Welcome to Raleskip!', progress: 100 }
  ]

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark')
    }
    
    const trackPageLoad = performanceMonitor.trackPageLoad('app_init')
    
    let currentStageIndex = 0
    let isActive = true
    
    const updateProgress = async () => {
      if (!isActive) return
      
      const currentStageData = loadingStages[currentStageIndex]
      const nextStageData = loadingStages[currentStageIndex + 1]
      
      setLoadingStage(currentStageData.stage)
      
      if (!nextStageData) {
        setLoadingProgress(100)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        if (isActive) {
          setIsLoading(false)
          trackPageLoad()
          
          toast.success('Portfolio loaded successfully!', {
            description: 'Welcome to Aayush Pawar\'s digital showcase',
            duration: 3000,
          })
        }
        return
      }
      
      let currentProgress = currentStageData.progress
      
      const progressInterval = setInterval(() => {
        if (!isActive) {
          clearInterval(progressInterval)
          return
        }
        
        const progressIncrement = Math.random() * 3 + 1
        currentProgress = Math.min(currentProgress + progressIncrement, nextStageData.progress)
        
        setLoadingProgress(currentProgress)
        
        if (currentProgress >= nextStageData.progress) {
          clearInterval(progressInterval)
          currentStageIndex++
          setTimeout(updateProgress, 50)
        }
      }, 50)
    }
    
    const initTimer = setTimeout(updateProgress, 100)
    
    return () => {
      isActive = false
      clearTimeout(initTimer)
    }
  }, [])

  // Enhanced page navigation with analytics
  const handlePageChange = useCallback((page: Page) => {
    if (page === currentPage) return
    
    const previousPage = currentPage
    const trackPageLoad = performanceMonitor.trackPageLoad(`page_${page}`)
    
    setCurrentPage(page)
    
    if (typeof window !== 'undefined') {
      window.history.pushState({ page }, '', `#${page}`)
      document.title = `${page.charAt(0).toUpperCase() + page.slice(1)} - ${ENV.siteName}`
    }
    
    setTimeout(trackPageLoad, 100)
    
    log(`[Navigation] ${previousPage} -> ${page}`)
  }, [currentPage])

  // Handle initial URL routing
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const hash = window.location.hash.slice(1) as Page
      const validPages: Page[] = ['home', 'about', 'skills', 'journey', 'projects', 'contact']
      
      if (validPages.includes(hash)) {
        setCurrentPage(hash)
      } else if (hash) {
        log(`[Routing] Invalid route: ${hash}, redirecting to home`)
        window.history.replaceState({}, '', '#home')
      }
    } catch (error) {
      logError('[Routing] Error handling initial route:', error)
    }
  }, [])

  // Enhanced Kinetic Text Component with proper type checking
  const KineticText = useCallback(({ 
    children, 
    className = "", 
    animation = "kinetic-glow"
  }: { 
    children: React.ReactNode, 
    className?: string, 
    animation?: string
  }) => {
    const textContent = React.Children.toArray(children).join('')
    
    if (typeof textContent !== 'string' || !textContent.trim()) {
      return <span className={className}>{children}</span>
    }

    if (shouldReduceMotion || textContent.length > 50) {
      return <span className={className}>{textContent}</span>
    }

    return (
      <span className={`${animation} ${className}`}>
        {textContent.split('').map((char, index) => (
          <span 
            key={`kinetic-char-${index}-${char === ' ' ? 'space' : char}`}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    )
  }, [shouldReduceMotion])

  // Production Loader
  const RaleskipLoader = useMemo(() => (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 0.95,
          filter: "blur(10px)"
        }}
        transition={{ 
          duration: 0.8, 
          ease: [0.76, 0, 0.24, 1] 
        }}
      >
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0"
            animate={shouldReduceMotion ? {} : {
              background: [
                'radial-gradient(ellipse 60% 60% at 30% 70%, rgba(16, 185, 129, 0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 70% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
                'radial-gradient(ellipse 50% 50% at 70% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 60%), radial-gradient(ellipse 70% 70% at 20% 70%, rgba(16, 185, 129, 0.2) 0%, transparent 60%)',
              ]
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 10, repeat: Infinity, ease: "linear" }}
          />
          
          {!shouldReduceMotion && backgroundParticles.slice(0, 6).map((particle) => (
            <motion.div
              key={`loader-${particle.id}`}
              className="absolute rounded-full opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size * 2,
                height: particle.size * 2,
                background: particle.color,
                filter: `blur(1px)`,
                boxShadow: `0 0 8px ${particle.color}20`
              }}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.2, 0.4, 0.2],
                x: [0, Math.sin(particle.id) * 30],
                y: [0, Math.cos(particle.id) * 30],
              }}
              transition={{
                duration: particle.duration * 0.5,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="relative text-center z-20 max-w-md px-6">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="relative w-16 h-16 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-purple-400"
                animate={shouldReduceMotion ? {} : { rotate: 360 }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-transparent border-l-cyan-400 border-b-amber-400"
                animate={shouldReduceMotion ? {} : { rotate: -360 }}
                transition={{ duration: shouldReduceMotion ? 0 : 1.8, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl lg:text-5xl font-display font-black text-white">
              <KineticText 
                className="brand-text-dark"
                animation={shouldReduceMotion ? "" : "kinetic-neon-pulse"}
              >
                Raleskip
              </KineticText>
            </h1>
            
            <p className="text-white/70 font-body text-base leading-relaxed">
              <KineticText animation={shouldReduceMotion ? "" : "kinetic-glow"}>
                Digital Marketing Expert & AI Innovation Leader
              </KineticText>
            </p>
          </motion.div>

          <motion.div
            className="mt-10 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="w-72 h-2 neuro-inset rounded-full mx-auto overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-cyan-500 rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between px-4 text-sm">
              <motion.span
                className="text-white/60 font-mono"
                key={loadingStage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {loadingStage}
              </motion.span>
              <motion.span
                className="text-white/80 font-bold tabular-nums"
                animate={shouldReduceMotion ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: shouldReduceMotion ? 0 : 1, repeat: Infinity }}
              >
                {Math.round(loadingProgress)}%
              </motion.span>
            </div>
          </motion.div>

          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-amber-400 text-sm font-mono"
            >
              <span>⚠️</span>
              <span>Offline Mode Active</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  ), [loadingProgress, loadingStage, isOnline, shouldReduceMotion, backgroundParticles, KineticText])

  // Background System
  const EnhancedBackground = useMemo(() => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        animate={shouldReduceMotion ? {} : {
          background: [
            'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.06) 0%, rgba(10, 10, 10, 1) 70%)',
            'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.06) 0%, rgba(10, 10, 10, 1) 70%)',
            'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.06) 0%, rgba(10, 10, 10, 1) 70%)',
          ]
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 25, repeat: Infinity, ease: "linear" }}
      />
      
      {!shouldReduceMotion && (
        <div className="absolute inset-0 opacity-15">
          {backgroundParticles.map((particle) => (
            <motion.div
              key={`bg-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                filter: `blur(0.5px)`,
                boxShadow: `0 0 4px ${particle.color}15`
              }}
              animate={{
                scale: [0.2, 0.8, 0.2],
                opacity: [0.1, 0.3, 0.1],
                x: [0, Math.sin(particle.id * 0.1) * 100],
                y: [0, Math.cos(particle.id * 0.1) * 100],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  ), [shouldReduceMotion, backgroundParticles])

  // Enhanced page rendering
  const renderCurrentPage = useCallback(() => {
    const pageComponents = {
      'home': () => (
        <>
          <Hero onNavigate={handlePageChange} />
          <About />
        </>
      ),
      'about': () => <About />,
      'skills': () => (
        <Suspense fallback={<ProductionPageLoader stage="Loading expertise..." />}>
          <Skills />
        </Suspense>
      ),
      'journey': () => (
        <Suspense fallback={<ProductionPageLoader stage="Loading professional journey..." />}>
          <ProfessionalJourney />
        </Suspense>
      ),
      'projects': () => (
        <Suspense fallback={<ProductionPageLoader stage="Loading projects..." />}>
          <ProjectsPage />
        </Suspense>
      ),
      'contact': () => (
        <Suspense fallback={<ProductionPageLoader stage="Loading contact information..." />}>
          <ContactPage />
        </Suspense>
      )
    }

    try {
      return pageComponents[currentPage]?.() || pageComponents['home']()
    } catch (error) {
      logError(`[Page Render] Error rendering ${currentPage}:`, error)
      return <DefaultErrorFallback error={error as Error} retry={() => typeof window !== 'undefined' && window.location.reload()} />
    }
  }, [currentPage, handlePageChange])

  return (
    <ProductionErrorBoundary>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative font-body smooth-scroll">
        <Toaster 
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            style: {
              background: 'var(--neuro-base)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--foreground)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            className: 'font-body',
            duration: 4000,
          }}
        />
        
        <AnimatePresence>
          {isLoading && RaleskipLoader}
        </AnimatePresence>

        {!isLoading && (
          <>
            {EnhancedBackground}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="relative z-10"
            >
              <Navigation 
                currentPage={currentPage} 
                setCurrentPage={handlePageChange} 
              />
              
              <main className="relative min-h-screen" role="main">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                  >
                    {renderCurrentPage()}
                  </motion.div>
                </AnimatePresence>
              </main>
              
              <footer className="relative overflow-hidden neuro-base mt-20 border-t border-emerald-500/20" role="contentinfo">
                <div className="absolute inset-0 gradient-mesh-dark opacity-20" />
                
                <div className="relative max-w-6xl mx-auto px-6 py-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      className="w-16 h-16 mx-auto flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <img 
                        src={raleskipLogo} 
                        alt="Raleskip Logo"
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))'
                        }}
                        loading="lazy"
                        width="64"
                        height="64"
                      />
                    </motion.div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-display font-bold text-white">
                        <KineticText 
                          animation={shouldReduceMotion ? "" : "kinetic-neon-pulse"}
                          className="brand-text-dark"
                        >
                          Raleskip
                        </KineticText>
                      </h3>
                      
                      <p className="text-white/60 font-body text-base max-w-md mx-auto leading-relaxed">
                        <KineticText animation={shouldReduceMotion ? "" : "kinetic-glow"}>
                          Digital Marketing Expert • AI Innovation Leader • Creative Strategist
                        </KineticText>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-white/50 font-body">
                      <span className="neuro-flat px-4 py-2 rounded-lg">
                        <KineticText animation={shouldReduceMotion ? "" : "kinetic-glow"}>
                          © 2025 Aayush Pawar. All rights reserved.
                        </KineticText>
                      </span>
                      <span className="hidden sm:inline text-white/30">•</span>
                      <span className="neuro-flat px-4 py-2 rounded-lg">
                        <KineticText animation={shouldReduceMotion ? "" : "kinetic-glow"}>
                          v{ENV.appVersion} • Crafted with passion & precision
                        </KineticText>
                      </span>
                    </div>

                    {ENV.isDevelopment && (
                      <details className="mt-6 text-xs text-white/30 font-mono max-w-md mx-auto">
                        <summary className="cursor-pointer">Development Metrics</summary>
                        <div className="mt-3 p-4 bg-gray-800/50 rounded-lg text-left space-y-1">
                          <div>Environment: {ENV.isDevelopment ? 'Development' : 'Production'}</div>
                          <div>Version: {ENV.appVersion}</div>
                          <div>Build Date: {new Date(ENV.buildDate).toLocaleDateString()}</div>
                          <div>Performance Mode: {shouldReduceMotion ? 'Reduced Motion' : 'Full Animation'}</div>
                          <div>Network Status: {isOnline ? 'Online' : 'Offline'}</div>
                          <div>Session Duration: {Math.round((Date.now() - sessionStartTime) / 1000)}s</div>
                          <div>Session ID: {performanceMonitor.getSessionId().slice(0, 8)}...</div>
                        </div>
                      </details>
                    )}
                  </motion.div>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </div>
    </ProductionErrorBoundary>
  )
}

// Production Error Handling
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logError('[Global Error]:', event.error)
    
    if (ENV.isProduction && ENV.enableAnalytics && window.gtag) {
      window.gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false
      })
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    logError('[Unhandled Promise Rejection]:', event.reason)
    
    if (ENV.isProduction && ENV.enableAnalytics && window.gtag) {
      window.gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false
      })
    }
  })

  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (ENV.isDevelopment) {
          log(`[Performance] ${entry.name}: ${entry.duration}ms`)
        }
        
        if (ENV.isProduction && ENV.enableAnalytics && entry.duration > 100 && window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: entry.name,
            value: Math.round(entry.duration)
          })
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] })
  }
}

// Service Worker Registration (PWA)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && ENV.enableServiceWorker && ENV.isProduction) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        log('[SW] Service Worker registered successfully:', registration.scope)
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                toast.info('New version available!', {
                  description: 'Click to refresh and get the latest features',
                  duration: 10000,
                  action: {
                    label: 'Refresh',
                    onClick: () => window.location.reload()
                  }
                })
              }
            })
          }
        })
      })
      .catch((error) => {
        logError('[SW] Service Worker registration failed:', error)
      })
  })
}