import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
// VisitorTracker removed - general visitor tracking disabled

export const metadata: Metadata = {
  title: 'Writerly - A Modern Blog Platform',
  description: 'A beautiful, modern blog platform built with Next.js and Sanity',
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