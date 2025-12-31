'use client';

import { motion } from 'framer-motion';
import { SCENES } from '@/data/scenes';

interface ProgressIndicatorProps {
  activeSceneIndex: number;
  onSceneClick: (index: number) => void;
}

export default function ProgressIndicator({
  activeSceneIndex,
  onSceneClick,
}: ProgressIndicatorProps) {
  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2"
      aria-label="Scene navigation"
    >
      {SCENES.map((scene, index) => {
        const isActive = index === activeSceneIndex;
        const isPast = index < activeSceneIndex;
        
        return (
          <button
            key={scene.id}
            onClick={() => onSceneClick(index)}
            className="group relative flex items-center justify-end py-1"
            aria-label={`Go to ${scene.chapter}`}
            aria-current={isActive ? 'step' : undefined}
          >
            {/* Chapter label on hover */}
            <span 
              className="absolute right-7 opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs font-mono text-dust whitespace-nowrap pr-2 translate-x-2 group-hover:translate-x-0"
            >
              {scene.chapter}
            </span>

            {/* Dot with animation */}
            <motion.div
              className="relative"
              animate={{
                scale: isActive ? 1.3 : 1,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Outer glow for active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-ember"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Main dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-ember shadow-lg shadow-ember/50' 
                    : isPast 
                      ? 'bg-dust/60 group-hover:bg-dust' 
                      : 'bg-smoke group-hover:bg-dust/50'
                }`}
              />
            </motion.div>
          </button>
        );
      })}
      
      {/* Connecting line */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-px bg-smoke/40 -z-10"
        style={{ marginLeft: '0.25rem' }}
      />
    </nav>
  );
}
