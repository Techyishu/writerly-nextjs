import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  slug: string;
  image?: string;
}

export const BlogCard = ({ title, excerpt, date, readTime, category, slug, image }: BlogCardProps) => {
  return (
    <Link href={`/post/${slug}`} className="group block">
      <Card className="h-full overflow-hidden border-white/20 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 hover:bg-white/20 hover:shadow-lg hover:shadow-purple-400/20">
        {image && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="p-4 sm:p-6">
          <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
            <Badge variant="secondary" className="bg-purple-400/20 text-purple-300 text-xs w-fit">
              {category}
            </Badge>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{date}</span>
                <span className="sm:hidden">
                  {date && !isNaN(new Date(date).getTime()) 
                    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                    : 'No date'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readTime}
              </span>
            </div>
          </div>
          <CardTitle className="line-clamp-2 text-lg sm:text-xl font-light text-white transition-colors group-hover:text-purple-300">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <CardDescription className="line-clamp-3 text-sm leading-relaxed text-white/80">
            {excerpt}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
