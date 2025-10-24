import { BlogHeader } from "@/components/BlogHeader";
import { CosmicBackground } from "@/components/CosmicBackground";
import { Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  return (
    <CosmicBackground>
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <MessageSquare className="mx-auto mb-6 h-16 w-16 text-purple-400" />
            <h1 className="mb-4 text-4xl font-light tracking-wide md:text-5xl text-white">
              Get in Touch
            </h1>
            <p className="text-lg text-white/70">
              Share your thoughts, stories, or simply say hello.
            </p>
          </div>

          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-light text-white">Send a Message</CardTitle>
              <CardDescription className="text-white/70">
                Your words matter. I read every message that comes through.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-white">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Share your thoughts..."
                    rows={6}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                  />
                </div>

                <Button variant="literary" size="lg" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </CosmicBackground>
  );
}
