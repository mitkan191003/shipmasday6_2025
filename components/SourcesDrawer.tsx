'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, forwardRef } from 'react';
import { ALL_SOURCES, Source } from '@/data/scenes';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedSourceId?: string | null;
  reducedMotion: boolean;
}

export default function SourcesDrawer({
  isOpen,
  onClose,
  highlightedSourceId,
  reducedMotion,
}: SourcesDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Filter sources based on search
  const filteredSources = ALL_SOURCES.filter((source) => {
    const query = searchQuery.toLowerCase();
    return (
      source.org.toLowerCase().includes(query) ||
      source.title.toLowerCase().includes(query) ||
      source.quote.toLowerCase().includes(query) ||
      source.year.includes(query)
    );
  });

  // Scroll to highlighted source
  useEffect(() => {
    if (isOpen && highlightedSourceId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isOpen, highlightedSourceId]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const animationProps = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { x: '100%', opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0 },
        transition: { type: 'spring', damping: 25, stiffness: 200 },
      };

  const overlayAnimation = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="drawer-overlay"
            onClick={onClose}
            {...overlayAnimation}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            className="drawer-panel overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Sources"
            {...animationProps}
          >
            <div className="sticky top-0 bg-ash z-10 p-6 border-b border-smoke">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl text-bone">Sources</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-smoke rounded-lg transition-colors"
                  aria-label="Close sources drawer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-smoke border border-dust/30 rounded-lg px-4 py-3 pl-10 text-bone placeholder:text-dust focus:outline-none focus:border-ember"
                  aria-label="Search sources"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dust"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {filteredSources.length === 0 ? (
                <p className="text-dust text-center py-8">No sources found</p>
              ) : (
                filteredSources.map((source) => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    isHighlighted={source.id === highlightedSourceId}
                    ref={source.id === highlightedSourceId ? highlightedRef : null}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface SourceCardProps {
  source: Source;
  isHighlighted: boolean;
}

const SourceCard = forwardRef<HTMLDivElement, SourceCardProps>(
  function SourceCard({ source, isHighlighted }, ref) {
    return (
      <div
        ref={ref}
        id={`source-${source.id}`}
        className={`source-card transition-all duration-300 ${
          isHighlighted ? 'ring-2 ring-ember bg-ember/10' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="inline-block bg-smoke text-dust text-xs font-mono px-2 py-1 rounded mb-2">
              {source.org}
            </span>
            <h3 className="font-body text-bone font-medium leading-tight mb-1">
              {source.title}
            </h3>
            <span className="text-dust text-sm">{source.year}</span>
          </div>
        </div>

        <blockquote className="text-sm">&ldquo;{source.quote}&rdquo;</blockquote>

        {source.note && (
          <div className="mt-3 flex items-start gap-2 text-xs text-dust bg-void/50 p-2 rounded">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{source.note}</span>
          </div>
        )}

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-ember hover:text-rust transition-colors text-sm"
        >
          <span>View source</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    );
  }
);
