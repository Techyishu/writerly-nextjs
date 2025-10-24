"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import welcomeBg from "@/assets/welcome-background.jpeg";
import readyBg from "@/assets/ready-background.jpeg";
import shadowsBg from "@/assets/shadows-background.jpeg";

interface WelcomeScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    image: readyBg,
    text: "Are you ready?",
    alt: "Ancient book with candlelight"
  },
  {
    image: welcomeBg,
    text: "Welcome to Arunasblog",
    alt: "Magical book with sparkles"
  },
  {
    image: shadowsBg,
    text: "The shadows hold more than just secrets.",
    alt: "Mysterious eye in darkness"
  }
];

export const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleNext();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [currentSlide]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url(${slides[currentSlide].image.src})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
        <h1
          className={`mb-12 text-4xl font-light tracking-wide text-white transition-all duration-500 sm:text-5xl md:text-6xl lg:text-7xl ${
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
          style={{ textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)" }}
        >
          {slides[currentSlide].text}
        </h1>

        <Button
          variant="literary"
          size="lg"
          onClick={handleNext}
          className={`text-base px-8 py-6 transition-all duration-500 ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          Continue
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index !== currentSlide) {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsTransitioning(false);
                  }, 300);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
