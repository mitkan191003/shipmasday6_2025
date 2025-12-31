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
  // Determine which cards to show based on scene progress
  const cardCount = scene.statCards.length;
  const progressPerCard = 1 / (cardCount + 1);

  const containerVariants = reducedMotion
    ? {}
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.25, delayChildren: 0.4 },
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.3 }
        },
      };

  const cardVariants = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, x: 40, scale: 0.96 },
        visible: {
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
          opacity: 0,
          x: 25,
          scale: 0.98,
          transition: { duration: 0.25 },
        },
      };

  return (
    <div className="fixed right-0 bottom-0 w-full md:w-1/2 lg:w-2/5 p-6 md:p-8 z-20 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene.id}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-4 flex flex-col items-end"
        >
          {scene.statCards.map((card, index) => {
            const cardStart = (index + 0.6) * progressPerCard;
            const isVisible = sceneProgress >= cardStart;

            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate={isVisible ? 'visible' : 'hidden'}
                className="stat-card max-w-sm pointer-events-auto"
                style={{
                  background: 'rgba(26, 26, 30, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(42, 42, 48, 0.6)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                }}
              >
                <p className="text-bone text-base md:text-lg font-body leading-relaxed">
                  {card.text}
                  {card.sourceIds.map((sourceId) => {
                    const source = getSourceById(sourceId);
                    if (!source) return null;

                    // Get citation number (order in ALL_SOURCES)
                    const citationNum = getCitationNumber(sourceId);

                    return (
                      <button
                        key={sourceId}
                        onClick={() => onCitationClick(sourceId)}
                        className="citation-sup ml-0.5 font-mono"
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
