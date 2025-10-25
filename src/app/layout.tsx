import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
// VisitorTracker removed - general visitor tracking disabled

export const metadata: Metadata = {
  title: 'Aruna\'s Blog - Stories That Inspire',
  description: 'Explore captivating stories and insights on Aruna\'s Blog. Discover tales that blur the lines between dreams and reality.',
  keywords: 'blog, stories, inspiration, writing, tales, Aruna, creative writing',
  authors: [{ name: 'Aruna' }],
  openGraph: {
    title: 'Aruna\'s Blog - Stories That Inspire',
    description: 'Explore captivating stories and insights on Aruna\'s Blog. Discover tales that blur the lines between dreams and reality.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aruna\'s Blog - Stories That Inspire',
    description: 'Explore captivating stories and insights on Aruna\'s Blog. Discover tales that blur the lines between dreams and reality.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* VisitorTracker removed - general visitor tracking disabled */}
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}