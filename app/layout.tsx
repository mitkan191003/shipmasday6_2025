import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Fast Fashion | A Scroll-Driven Story',
  description:
    'An interactive exploration of the fast fashion industry and its environmental impact. From a single shirt to global systems.',
  keywords: [
    'fast fashion',
    'sustainability',
    'textile waste',
    'microplastics',
    'climate change',
    'scrollytelling',
  ],
  authors: [{ name: 'Documentary Project' }],
  openGraph: {
    title: 'Fast Fashion | A Scroll-Driven Story',
    description:
      'An interactive exploration of the fast fashion industry and its environmental impact.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fast Fashion | A Scroll-Driven Story',
    description:
      'An interactive exploration of the fast fashion industry and its environmental impact.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-void text-bone min-h-screen">
        {children}
      </body>
    </html>
  );
}

