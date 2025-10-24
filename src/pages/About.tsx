import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import profilePhoto from "@/assets/WhatsApp Image 2025-10-21 at 1.21.30 AM.jpeg";
import logoImage from "@/assets/WhatsApp Image 2025-10-21 at 1.22.36 AM.jpeg";

export default function About() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {/* Stars */}
        <div className="absolute inset-0 opacity-60">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <img 
            src={logoImage.src} 
            alt="Aruna.S Logo" 
            className="h-14 w-14 md:h-16 md:w-16 lg:h-18 lg:w-18 object-contain drop-shadow-xl"
          />
          <span className="text-3xl font-semibold text-white md:text-4xl lg:text-5xl">Aruna.S</span>
        </div>
        <Link 
          href="/" 
          className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            {/* Profile Picture */}
            <div className="relative flex-shrink-0 animate-float">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 p-1 shadow-2xl animate-glow">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img 
                    src={profilePhoto.src} 
                    alt="Aruna.S - Author, Blogger, Banking Professional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Author Information */}
            <div className="flex-1 text-center md:text-left">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-wide">
                About Aruna.S
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-white/90 mb-2 font-light">
                Author | Blogger | Banking Professional
              </p>
              
              {/* Location */}
              <p className="text-lg text-white/70 mb-8">
                Based in Pune, India
              </p>
            </div>
          </div>

          {/* About Content */}
          <div className="prose prose-lg prose-invert max-w-none mb-16">
            <p className="text-white text-lg leading-relaxed mb-6">
              Aruna.S is an author based in Pune, where she lives with her two daughters. She is known for her books{" "}
              <span className="text-purple-400 font-semibold">Agarkas the King of Satan</span>,{" "}
              <span className="text-purple-400 font-semibold">The Whisper That Name Me</span>, and{" "}
              <span className="text-purple-400 font-semibold">Agarkas the Return of the King</span>.
            </p>
            
            <p className="text-white text-lg leading-relaxed mb-6">
              Alongside her literary career, Aruna.S is also a passionate blogger and is currently working on her fourth book. She balances her creative pursuits with a professional career, working in the banking sector.
            </p>
            
            <p className="text-white text-lg leading-relaxed">
              While her books explore worlds of fantasy and shadow, her blog bridges those fictional worlds with reality—sharing insights into her writing process, the sparks of inspiration found in daily life, and the chaotic, wonderful balancing act of being a mother, a banker, and a storyteller.
            </p>
          </div>

          {/* Published Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-purple-400 mb-8">
              Published Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 group">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Agarkas the King of Satan</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors">A dark fantasy novel exploring themes of power and redemption.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 group">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">The Whisper That Name Me</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors">A mysterious tale of identity and self-discovery.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300 group">
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Agarkas the Return of the King</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors">The epic conclusion to the Agarkas saga.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
