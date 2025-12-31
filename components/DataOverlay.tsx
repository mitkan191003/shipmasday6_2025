'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Scene, getSourceById } from '@/data/scenes';

interface DataOverlayProps {
  scene: Scene;
  sceneProgress: number;
  onCitationClick: (sourceId: string) => void;
  reducedMotion: boolean;
}

export default function DataOverlay({
  scene,
  sceneProgress,
  onCitationClick,
  reducedMotion,
}: DataOverlayProps) {
  // Get placement configuration with defaults
  const placement = scene.statsPlacement || {};
  const vertical = placement.vertical || 'top';
  const horizontal = placement.horizontal || 'center';
  const offsetY = placement.offsetY || 0;
  const offsetX = placement.offsetX || 0;

  // Calculate entry progress (15% to 30% of scene = entry animation)
  // Delayed entry so previous scene stats are fully gone
  const entryProgress = Math.min(1, Math.max(0, (sceneProgress - 0.15) / 0.15));
  // Exit earlier (55% to 75%) so stats are gone before next scene starts
  const exitProgress = Math.max(0, (sceneProgress - 0.55) / 0.2);
  
  // Combined visibility - only visible during middle portion of scene
  const isVisible = sceneProgress >= 0.1 && exitProgress < 1;
  
  // Calculate entry/exit Y offset for scroll animation
  const entryOffset = (1 - easeOutCubic(entryProgress)) * 100; // Start 100vh below
  const exitOffset = easeInCubic(exitProgress) * -100; // Exit 100vh above
  const yOffset = entryOffset + exitOffset + offsetY;
  
  // Calculate opacity
  const entryOpacity = easeOutCubic(entryProgress);
  const exitOpacity = 1 - easeInCubic(exitProgress);
  const opacity = Math.min(entryOpacity, exitOpacity);

  // Build position classes based on placement
  const getPositionClasses = () => {
    const classes: string[] = ['fixed', 'z-30', 'pointer-events-none'];
    
    // Vertical positioning
    switch (vertical) {
      case 'top':
        classes.push('top-[15%]');
        break;
      case 'center':
        classes.push('top-1/2', '-translate-y-1/2');
        break;
      case 'bottom':
        classes.push('bottom-[25%]');
        break;
    }
    
    // Horizontal positioning
    switch (horizontal) {
      case 'left':
        classes.push('left-8', 'md:left-12');
        break;
      case 'center':
        classes.push('left-1/2', '-translate-x-1/2');
        break;
      case 'right':
        classes.push('right-8', 'md:right-12');
        break;
    }
    
    return classes.join(' ');
  };

  const containerVariants = reducedMotion
    ? {}
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.15, delayChildren: 0.1 },
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.3 }
        },
      };

  const cardVariants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
          opacity: 0,
          scale: 0.98,
          transition: { duration: 0.25 },
        },
      };

  if (!isVisible) return null;

  return (
    <div 
      className={getPositionClasses()}
      style={{
        transform: `translateY(${yOffset}vh) ${horizontal === 'center' ? 'translateX(-50%)' : ''} ${vertical === 'center' ? 'translateY(-50%)' : ''}`,
        opacity: opacity,
        marginLeft: horizontal !== 'center' ? `${offsetX}vw` : undefined,
        left: horizontal === 'center' ? `calc(50% + ${offsetX}vw)` : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`space-y-4 flex flex-col ${horizontal === 'right' ? 'items-end' : horizontal === 'left' ? 'items-start' : 'items-center'}`}
        >
          {scene.statCards.map((card, index) => {
            const cardStart = (index + 0.3) * (0.5 / (scene.statCards.length + 1));
            const isCardVisible = sceneProgress >= cardStart;

            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate={isCardVisible ? 'visible' : 'hidden'}
                className="stat-card pointer-events-auto max-w-xl w-[90vw] md:w-auto"
                style={{
                  background: 'rgba(26, 26, 30, 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 107, 53, 0.1)',
                  padding: '1.5rem 2rem',
                  borderRadius: '12px',
                }}
              >
                <p className="text-bone text-lg md:text-xl lg:text-2xl font-body leading-relaxed text-center">
                  {card.text}
                  {card.sourceIds.map((sourceId) => {
                    const source = getSourceById(sourceId);
                    if (!source) return null;

                    const citationNum = getCitationNumber(sourceId);

                    return (
                      <button
                        key={sourceId}
                        onClick={() => onCitationClick(sourceId)}
                        className="citation-sup ml-1 font-mono text-accent hover:text-orange-300 transition-colors"
                        aria-label={`View source ${citationNum}: ${source.org}`}
                        title={`${source.org}: ${source.title}`}
                      >
                        [{citationNum}]
                      </button>
                    );
                  })}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helper to get consistent citation numbers
function getCitationNumber(sourceId: string): number {
  const sourceOrder = [
    'S_UNEP_2025_PR',
    'S_UNEP_2025_PR_2000_2015',
    'S_UNEP_2025_STORY_TRUCK',
    'S_EMF_TEXTILES_REPORT_TRUCK',
    'S_EMF_TEXTILES_REPORT_RECYCLE',
    'S_EMF_TEXTILES_REPORT_87',
    'S_EMF_FASHION_OVERVIEW_TRUCK',
    'S_TE_MMR_2023_POLY',
    'S_TE_MMR_2023_PER_CAPITA',
    'S_IUCN_2017_MICRO',
    'S_JAMBECK_2015_OCEAN',
    'S_UNEP_2021_METHANE',
    'S_MCKINSEY_GFA_2020_FOC',
    'S_WRAP_2024_LIFETIME',
  ];
  return sourceOrder.indexOf(sourceId) + 1;
}

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}
