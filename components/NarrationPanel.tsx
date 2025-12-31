'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scene } from '@/data/scenes';

interface NarrationPanelProps {
  scene: Scene;
  sceneProgress: number;
  reducedMotion: boolean;
}

export default function NarrationPanel({
  scene,
  sceneProgress,
  reducedMotion,
}: NarrationPanelProps) {
  // Calculate which narration lines should be visible
  // Compress narration to first 55% of scene, leaving buffer at end
  const lineCount = scene.narrationLines.length;
  const narrationWindow = 0.55; // All lines appear within first 55%
  const progressPerLine = narrationWindow / (lineCount + 1);

  const containerVariants = reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2, delayChildren: 0.1 },
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.4 }
        },
      };

  const lineVariants = reducedMotion
    ? { 
        hidden: { opacity: 0 }, 
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, y: 25 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
          opacity: 0,
          y: -15,
          transition: { duration: 0.35 },
        },
      };

  const headlineVariants = reducedMotion
    ? { 
        hidden: { opacity: 0 }, 
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.97 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } },
      };

  return (
    <div className="fixed left-0 top-0 h-full w-full md:w-3/5 lg:w-1/2 flex items-center pointer-events-none z-20">
      {/* Subtle background for text readability - not covering the text */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,12,0.75) 0%, rgba(10,10,12,0.5) 40%, transparent 70%)',
        }}
      />
      
      <div className="relative px-8 md:px-12 lg:px-16 max-w-xl z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene.id}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-5"
          >
            {/* Chapter label */}
            <motion.div
              variants={lineVariants}
              className="flex items-center gap-3"
            >
              <span className="w-10 h-px bg-ember" />
              <span className="font-mono text-xs tracking-[0.2em] text-ember uppercase">
                {scene.chapter}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={headlineVariants}
              className="font-display text-3xl md:text-4xl lg:text-5xl text-bone leading-[1.15] text-balance"
              style={{
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              }}
            >
              {scene.headline}
            </motion.h1>

            {/* Narration lines */}
            <div className="space-y-4 mt-6">
              {scene.narrationLines.map((line, index) => {
                const lineStart = (index + 0.5) * progressPerLine;
                const isVisible = sceneProgress >= lineStart;

                return (
                  <motion.p
                    key={`${scene.id}-line-${index}`}
                    variants={lineVariants}
                    initial="hidden"
                    animate={isVisible ? 'visible' : 'hidden'}
                    className="text-bone/95 font-light leading-relaxed"
                    style={{
                      fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                      lineHeight: 1.7,
                      textShadow: '0 1px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    {line}
                  </motion.p>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
