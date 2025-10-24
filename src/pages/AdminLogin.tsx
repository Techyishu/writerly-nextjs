"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Prevent static generation
export const runtime = 'nodejs';
import { CosmicBackground } from '@/components/CosmicBackground';
import { BlogHeader } from '@/components/BlogHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return;

    try {
      await login(email, password);
      toast.success('Login successful!');
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-md">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-light text-white text-center">
                Admin Login
              </CardTitle>
              <CardDescription className="text-white/70 text-center">
                Sign in to access the admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="literary" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </CosmicBackground>
  );
}
