'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveScene, getActiveSceneIndex, SCENES } from '@/data/scenes';
import NarrationPanel from './NarrationPanel';
import DataOverlay from './DataOverlay';
import SourcesDrawer from './SourcesDrawer';
import ProgressIndicator from './ProgressIndicator';

// Dynamic import for Canvas to avoid SSR issues
const CanvasScene = dynamic(() => import('./CanvasScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-void flex items-center justify-center">
      <div className="text-dust font-mono text-sm">Loading experience...</div>
    </div>
  ),
});

// Increased scroll multiplier for more scroll space per scene
const SCROLL_MULTIPLIER = 150; // vh per scene

export default function ScrollyExperience() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(Date.now());
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle scroll with smooth progress calculation
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll height based only on the scroll container, not including sources
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;
      
      const containerHeight = scrollContainer.offsetHeight;
      const scrollHeight = containerHeight - window.innerHeight;
      
      // Calculate progress based only on scroll container, capped at 1.0
      // This ensures sources only appear after all scenes are complete
      const adjustedProgress = Math.min(1, Math.max(0, window.scrollY / Math.max(scrollHeight, 1)));
      
      // Smooth the progress value
      setScrollProgress(prev => {
        const diff = adjustedProgress - prev;
        // Faster response but still smooth
        return prev + diff * 0.15;
      });

      lastScrollTime.current = Date.now();

      // Clear existing snap timeout
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      // Set up snap after scroll stops (optional gentle snap)
      snapTimeoutRef.current = setTimeout(() => {
        // Only snap if user has stopped scrolling for a moment
        if (Date.now() - lastScrollTime.current >= 150) {
          // Gentle snap towards nearest scene boundary
          const currentIndex = getActiveSceneIndex(adjustedProgress);
          const scene = SCENES[currentIndex];
          const sceneMiddle = (scene.scroll.start + scene.scroll.end) / 2;
          
          // Only snap if we're close to a boundary
          const distToStart = Math.abs(adjustedProgress - scene.scroll.start);
          const distToEnd = Math.abs(adjustedProgress - scene.scroll.end);
          
          if (distToStart < 0.02 || distToEnd < 0.02) {
            // Near a boundary, snap to nearest scene center
            const targetProgress = adjustedProgress < sceneMiddle ? scene.scroll.start + 0.01 : scene.scroll.end - 0.01;
            const targetScroll = targetProgress * Math.max(scrollHeight, 1);
            
            if (Math.abs(window.scrollY - targetScroll) > 10) {
              setIsSnapping(true);
              window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
              });
              setTimeout(() => setIsSnapping(false), 500);
            }
          }
        }
      }, 200);
    };

    // Use requestAnimationFrame for smoother updates
    let rafId: number;
    const smoothScroll = () => {
      handleScroll();
      rafId = requestAnimationFrame(smoothScroll);
    };
    
    rafId = requestAnimationFrame(smoothScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, []);

  // Get current scene data
  const activeScene = getActiveScene(scrollProgress);
  const activeSceneIndex = getActiveSceneIndex(scrollProgress);

  // Calculate progress within current scene (0 to 1)
  const sceneStart = activeScene.scroll.start;
  const sceneEnd = activeScene.scroll.end;
  const rawSceneProgress = (scrollProgress - sceneStart) / (sceneEnd - sceneStart);
  const sceneProgress = Math.min(1, Math.max(0, rawSceneProgress));

  // Handle citation click
  const handleCitationClick = useCallback((sourceId: string) => {
    setHighlightedSource(sourceId);
    setDrawerOpen(true);
  }, []);

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setHighlightedSource(null);
  }, []);

  // Handle scene navigation from progress dots
  const handleSceneClick = useCallback((index: number) => {
    const targetScene = SCENES[index];
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    const containerHeight = scrollContainer.offsetHeight;
    const scrollHeight = containerHeight - window.innerHeight;
    // Navigate to just after scene start
    const targetScroll = (targetScene.scroll.start + 0.01) * Math.max(scrollHeight, 1);
    window.scrollTo({ top: targetScroll, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);


  // Calculate total scroll height with buffer for last scenes
  // Increased buffer to ensure CHANGE scene is fully visible before sources appear
  const totalScrollHeight = SCENES.length * SCROLL_MULTIPLIER + 200; // Extra 200vh buffer

  return (
    <>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Scroll container - creates the scrollable area */}
      <div
        ref={scrollContainerRef}
        className="relative"
        style={{ height: `${totalScrollHeight}vh` }}
        id="main-content"
        role="main"
      >
        {/* 3D Canvas - fixed background */}
        <CanvasScene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

        {/* Content overlay */}
        <div className="content-overlay">
          {/* Narration Panel */}
          <NarrationPanel
            scene={activeScene}
            sceneProgress={sceneProgress}
            reducedMotion={reducedMotion}
          />

          {/* Data Overlay */}
          <DataOverlay
            scene={activeScene}
            sceneProgress={sceneProgress}
            onCitationClick={handleCitationClick}
            reducedMotion={reducedMotion}
          />

          {/* Progress Indicator */}
          <ProgressIndicator
            activeSceneIndex={activeSceneIndex}
            onSceneClick={handleSceneClick}
          />
        </div>
      </div>

      {/* Sources Section - placed with proper spacing */}
      <SourcesSection />

      {/* Sources Drawer */}
      <SourcesDrawer
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        highlightedSourceId={highlightedSource}
        reducedMotion={reducedMotion}
      />

      {/* Fixed UI Controls */}
      <div className="fixed top-6 left-6 z-40 flex items-center gap-4">
        {/* Logo/Title */}
        <h1 className="font-display text-xl text-bone drop-shadow-lg">
          <span className="text-ember">FAST</span> FASHION
        </h1>
      </div>

      {/* Sources Button */}
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-ash/90 backdrop-blur-sm rounded-lg text-sm text-dust hover:text-bone transition-colors border border-smoke/50"
          aria-label="View all sources"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="hidden sm:inline">Sources</span>
        </button>
      </div>

      {/* Scroll indicator (shows on first scene) */}
      <AnimatePresence>
        {scrollProgress < 0.03 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          >
            <span className="text-dust text-sm font-mono tracking-wide">Scroll to explore</span>
            <motion.div
              animate={reducedMotion ? {} : { y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg
                className="w-5 h-5 text-ember"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene transition indicator */}
      <div className="fixed bottom-6 left-6 z-30 pointer-events-none">
        <div className="text-dust/60 font-mono text-xs">
          {activeSceneIndex + 1} / {SCENES.length}
        </div>
      </div>
    </>
  );
}

// Final sources section at the bottom - with proper separation
function SourcesSection() {
  return (
    <section className="relative z-10 bg-void py-24 px-8 border-t border-smoke">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl text-bone mb-10">All Sources</h2>
        <div className="grid gap-5">
          <SourcesList />
        </div>
        
        {/* Footer
        <div className="mt-16 pt-8 border-t border-smoke/50 text-center">
          <p className="text-dust text-sm">
            A documentary exploration of fast fashion&apos;s environmental impact.
          </p>
          <p className="text-dust/60 text-xs mt-2">
            All statistics verified from cited sources.
          </p>
        </div> */}
      </div>
    </section>
  );
}

function SourcesList() {
  const [sources, setSources] = useState<
    Array<{ id: string; org: string; title: string; year: string; url: string; quote: string }>
  >([]);

  useEffect(() => {
    import('@/data/scenes').then((m) => {
      setSources(m.ALL_SOURCES);
    });
  }, []);

  return (
    <>
      {sources.map((source, index) => (
        <div
          key={source.id}
          className="flex items-start gap-4 p-5 bg-ash/60 rounded-lg border border-smoke/30 hover:border-smoke/50 transition-colors"
        >
          <span className="font-mono text-ember text-sm mt-0.5">[{index + 1}]</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-dust text-sm font-medium">{source.org}</span>
              <span className="text-dust/50 text-sm">·</span>
              <span className="text-dust/70 text-sm">{source.year}</span>
            </div>
            <h3 className="text-bone font-medium leading-snug mb-2">{source.title}</h3>
            <p className="text-dust/80 text-sm italic mb-3">&ldquo;{source.quote}&rdquo;</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-ember hover:text-rust text-sm transition-colors"
            >
              <span>View source</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      ))}
    </>
  );
}
