"use client";

import { useState, useEffect } from 'react';
// Popular posts temporarily disabled during Sanity migration
// import { postVisitorService } from '@/lib/sanity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PopularPost {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  published: boolean;
  created_at: string;
}

export const PopularPosts = ({ limit = 5 }: { limit?: number }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Popular Posts
        </CardTitle>
        <CardDescription className="text-white/70">
          Popular posts feature temporarily disabled during Sanity migration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-center py-4">This feature will be restored after Sanity setup is complete.</p>
      </CardContent>
    </Card>
  );
};
