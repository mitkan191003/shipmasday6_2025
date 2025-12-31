import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const ScrollyExperience = dynamic(
  () => import('@/components/ScrollyExperience'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-void flex flex-col items-center justify-center gap-6">
        {/* Loading animation */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-smoke rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-ember rounded-full animate-spin" />
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h1 className="font-display text-2xl text-bone mb-2">
            <span className="text-ember">FAST</span> FASHION
          </h1>
          <p className="text-dust font-mono text-sm">Loading experience...</p>
        </div>

        {/* Tagline */}
        <p className="text-dust/60 text-sm max-w-xs text-center mt-8">
          A scroll-driven story about the lifecycle of clothing
        </p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main>
      <ScrollyExperience />
    </main>
  );
}

