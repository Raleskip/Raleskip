'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react'

import { Button } from './ui/button'
import { ArrowRight, Sparkles, Mail, Eye, Brain, Cpu, Code, Activity, Rocket, TrendingUp } from 'lucide-react'
import { useRef, useEffect, useState, useCallback } from 'react'
import aayushPhoto from 'figma:asset/f768bb506045584da1daa65ca55661ab3701d060.png'
import cosmicGif from 'figma:asset/448c38470bc4d86f60b681b68a450460d4afcdb5.png'

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentTitle, setCurrentTitle] = useState(0)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const cosmicY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const opacityRange = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Bold title sequence with emerald focus
  const titleSequence = [
    {
      primary: "Digital First",
      secondary: "Marketer",
      color: "from-emerald-400 to-cyan-500",
      icon: Code,
      description: "Transforming brands through cutting-edge digital strategies"
    },
    {
      primary: "Design Thinking",
      secondary: "Expert", 
      color: "from-orange-400 to-yellow-500",
      icon: Sparkles,
      description: "Human-centered solutions through innovative design processes"
    },
    {
      primary: "Raconteur",
      secondary: "& Storyteller", 
      color: "from-emerald-500 to-teal-400",
      icon: Brain,
      description: "Crafting compelling narratives that drive engagement"
    },
    {
      primary: "AI Researcher",
      secondary: "& Innovator",
      color: "from-cyan-400 to-blue-500", 
      icon: Cpu,
      description: "Pioneering the future of artificial intelligence"
    }
  ]

  // Slower title cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitle((prev) => (prev + 1) % titleSequence.length)
    }, 10000) // Very slow 10 second intervals
    return () => clearInterval(interval)
  }, [titleSequence.length])

  const currentTitleData = titleSequence[currentTitle]

  // Button handlers
  const handleContactClick = useCallback(() => {
    if (onNavigate) {
      onNavigate('contact')
    } else {
      // Fallback: scroll to contact section or open email
      window.location.href = 'mailto:hello@raleskip.com?subject=Let\'s Create Magic Together!&body=Hi Aayush,%0D%0A%0D%0AI\'d love to discuss a potential collaboration opportunity.%0D%0A%0D%0ABest regards'
    }
  }, [onNavigate])

  const handleExploreClick = useCallback(() => {
    if (onNavigate) {
      onNavigate('projects')
    } else {
      // Fallback: scroll to projects section
      const projectsSection = document.getElementById('projects')
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [onNavigate])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Ultra High-Quality Cosmic Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {/* Primary Cosmic Scene Background */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          {/* Ultra High-Quality Cosmic Video Background */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{
                filter: [
                  'brightness(0.25) contrast(1.3) saturate(1.4)',
                  'brightness(0.3) contrast(1.35) saturate(1.5)',
                  'brightness(0.27) contrast(1.32) saturate(1.45)',
                  'brightness(0.25) contrast(1.3) saturate(1.4)',
                ],
                transform: [
                  'translateZ(0) scale(1.02)',
                  'translateZ(0) scale(1.04)',
                  'translateZ(0) scale(1.03)',
                  'translateZ(0) scale(1.02)',
                ]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1]
              }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                controlsList="nodownload"
                className="cosmic-video-cover absolute inset-0 w-full h-full object-cover"
                style={{
                  filter: 'inherit',
                  transform: 'inherit',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  backfaceVisibility: 'hidden',
                  willChange: 'filter, transform',
                }}
                onLoadedData={() => {
                  console.info('🌌 Cosmic video loaded successfully')
                }}
                onCanPlay={() => {
                  console.info('🌌 Cosmic video ready to play')
                }}
                onError={(e) => {
                  console.info('🌌 Video error, using fallback cosmic background')
                  // Show fallback background element
                  const fallback = e.currentTarget.parentElement?.parentElement?.querySelector('.cosmic-video-fallback')
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'block'
                  }
                  e.currentTarget.style.display = 'none'
                }}
                onStalled={() => {
                  console.info('🌌 Video stalled, checking fallback')
                }}
              >
                <source src={cosmicGif} type="video/mp4" />
                {/* Multiple format support - try common video formats */}
                <source src={cosmicGif.replace('.png', '.webm')} type="video/webm" />
                <source src={cosmicGif.replace('.png', '.mov')} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            </motion.div>

            {/* Fallback Background Image */}
            <motion.div
              className="cosmic-video-fallback absolute inset-0"
              style={{
                display: 'none',
                backgroundImage: `url(${cosmicGif})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(0.25) contrast(1.3) saturate(1.4)',
                transform: 'translateZ(0) scale(1.02)',
                backfaceVisibility: 'hidden',
                willChange: 'filter, transform',
              }}
              animate={{
                filter: [
                  'brightness(0.25) contrast(1.3) saturate(1.4)',
                  'brightness(0.3) contrast(1.35) saturate(1.5)',
                  'brightness(0.27) contrast(1.32) saturate(1.45)',
                  'brightness(0.25) contrast(1.3) saturate(1.4)',
                ],
                transform: [
                  'translateZ(0) scale(1.02)',
                  'translateZ(0) scale(1.04)',
                  'translateZ(0) scale(1.03)',
                  'translateZ(0) scale(1.02)',
                ]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "easeInOut",
                times: [0, 0.33, 0.66, 1]
              }}
            />
          </motion.div>

          {/* Professional Black Overlay System */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          
          {/* Content Readability Enhancement */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at center 40%, transparent 30%, rgba(0, 0, 0, 0.4) 70%)',
            }}
            animate={{
              opacity: [0.8, 1, 0.9, 0.8],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
          
          {/* Subtle Cosmic Accent Particles */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 25% 75%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 75% 25%, rgba(6, 182, 212, 0.06) 0%, transparent 40%),
                radial-gradient(circle at 50% 90%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)
              `,
            }}
            animate={{
              opacity: [0.3, 0.5, 0.4, 0.3],
              backgroundPosition: [
                '25% 75%, 75% 25%, 50% 90%',
                '30% 70%, 70% 30%, 55% 85%',
                '20% 80%, 80% 20%, 45% 95%',
                '25% 75%, 75% 25%, 50% 90%',
              ],
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "easeInOut",
              times: [0, 0.33, 0.66, 1]
            }}
          />
          
          {/* Enhanced Focus Area for Photo */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at center 45%, transparent 20%, rgba(0, 0, 0, 0.3) 60%)',
            }}
            animate={{
              opacity: [0.6, 0.8, 0.7, 0.6],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Fallback Video Background (kept for compatibility) */}
        <div className="absolute inset-0 overflow-hidden video-loading opacity-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="hero-video hero-video-enhanced gpu-accelerated"
            style={{ opacity: 0 }}
            onError={(e) => {
              console.info('🌌 Using high-quality cosmic background instead of video')
              e.currentTarget.style.display = 'none'
            }}
          >
            <source src="/assets/ai-animation-optimized.mp4" type="video/mp4" />
            <source src="/assets/ai-animation-optimized.webm" type="video/webm" />
          </video>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 text-center max-w-6xl mx-auto px-6"
        style={{ y: contentY, opacity: opacityRange }}
      >
        {/* Enhanced Content Background for GIF */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5" />
        
        {/* Content Container */}
        <div className="relative z-10">{/* Content will go here */}
        {/* Professional Opening Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mb-16 text-center"
        >
          <motion.div
            className="inline-block px-6 py-3 rounded-full bg-black/40 border border-emerald-500/30 backdrop-blur-sm mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-emerald-300 font-display font-semibold text-sm tracking-wide cosmic-text-enhance">
                Welcome to the Future of AI
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Professional Photo - Enhanced */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mb-16"
        >
          <div className="relative w-40 h-40 mx-auto">
            {/* Enhanced Glow Effect */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.4)',
                  '0 0 0 8px rgba(16, 185, 129, 0.1)',
                  '0 0 0 0 rgba(16, 185, 129, 0.4)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 p-1 backdrop-blur-sm">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 p-1">
                <img 
                  src={aayushPhoto} 
                  alt="Aayush Pawar - Digital Marketing Expert & AI Innovation Leader"
                  className="w-full h-full object-cover rounded-full border-2 border-emerald-400/30 shadow-2xl"
                  style={{
                    imageRendering: 'high-quality',
                    filter: 'brightness(1.05) contrast(1.1) saturate(1.1)',
                  }}
                />
              </div>
            </div>
            
            {/* Status Indicator */}
            <motion.div 
              className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full border-3 border-black/80 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Clean Title Sequence */}
        <motion.div className="mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.5 }}
              className="space-y-6"
            >
              {/* Primary Title - Human Readable */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight tracking-tight">
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTitleData.color}`}>
                  {currentTitleData.primary}
                </div>
              </h1>

              {/* Secondary Title - Balanced Size */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white/85 mt-2">
                {currentTitleData.secondary}
              </h2>

              {/* Icon - Proportioned */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <div className={`p-4 rounded-xl bg-gradient-to-r ${currentTitleData.color} shadow-lg border border-white/10`}>
                  <currentTitleData.icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Description - Readable */}
              <p className="text-lg lg:text-xl text-white/75 max-w-2xl mx-auto font-body font-medium leading-relaxed">
                {currentTitleData.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Name Section - User Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-sm">
            <div className="text-xl lg:text-2xl font-display font-bold text-white">
              Aayush Pawar
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <div className="text-sm text-emerald-300 font-semibold">
              Raleskip Founder
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - Balanced & Readable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-4xl mx-auto"
        >
          {[
            { 
              label: "Years of Innovation", 
              value: "8+", 
              icon: Rocket,
              color: "text-emerald-400"
            },
            { 
              label: "Users Impacted", 
              value: "500M+", 
              icon: TrendingUp,
              color: "text-cyan-400"
            },
            { 
              label: "Project Experience", 
              value: "30+", 
              icon: Brain,
              color: "text-yellow-400"
            },
            { 
              label: "Mobile Apps/WebApps", 
              value: "20+", 
              icon: Code,
              color: "text-orange-400"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="p-6 text-center rounded-xl bg-black/30 border border-white/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1, duration: 1 }}
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderColor: 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
              <div className={`text-2xl lg:text-3xl font-display font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs lg:text-sm text-white/60 font-body">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call-to-Action Buttons - User Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              size="lg" 
              onClick={handleContactClick}
              className="px-8 py-4 text-base font-display font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-0 rounded-xl shadow-lg hover:shadow-emerald-500/20"
            >
              <Mail className="w-5 h-5 mr-2" />
              Let's Create Magic
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleExploreClick}
              className="px-8 py-4 text-base font-display font-semibold border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 rounded-xl"
            >
              <Eye className="w-5 h-5 mr-2" />
              Explore Portfolio
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
        </div>
      </motion.div>
    </section>
  )
}