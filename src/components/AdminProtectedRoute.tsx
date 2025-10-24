"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Admin protection simplified for Sanity
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function AdminProtectedRoute({ 
  children, 
  requireSuperAdmin = false 
}: AdminProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    // Check if user is admin based on their role
    if (isAuthenticated && user) {
      setIsAdmin(user.role === 'admin');
      setIsSuperAdmin(user.role === 'admin');
    } else {
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
    setCheckingAdmin(false);
  }, [isAuthenticated, user]);

  // Show loading state
  if (isLoading || checkingAdmin) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-md text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Checking admin access...</p>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-md text-center">
            <Shield className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h1 className="mb-4 text-4xl font-light text-white">Access Denied</h1>
            <p className="mb-8 text-white/70">Please log in to access the admin panel.</p>
            <Link href="/admin/login">
              <Button variant="literary" size="lg">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-md text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="mb-4 text-4xl font-light text-white">Access Denied</h1>
            <p className="mb-8 text-white/70">
              You don't have admin privileges. Contact a super admin to get access.
            </p>
            <div className="space-y-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  // Requires super admin but user is not super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <CosmicBackground>
        <BlogHeader />
        <div className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-md text-center">
            <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="mb-4 text-4xl font-light text-white">Super Admin Required</h1>
            <p className="mb-8 text-white/70">
              This section requires super admin privileges. Contact a super admin for access.
            </p>
            <div className="space-y-4">
              <Link href="/admin">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Back to Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CosmicBackground>
    );
  }

  // User has required permissions
  return <>{children}</>;
}
