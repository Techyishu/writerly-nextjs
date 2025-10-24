import BlogPost from '@/pages/BlogPost';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPost slug={slug} />;
}
