"use client";

import { useState, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import Blog from "./Blog";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWelcomeStatus = () => {
      const now = Date.now();
      const lastWelcomeTime = localStorage.getItem('lastWelcomeTime');
      const welcomeShown = sessionStorage.getItem('welcomeShownThisSession');
      
      // Show welcome screen if:
      // 1. Never shown before, OR
      // 2. Not shown in this session AND it's been more than 10 minutes since last time
      const shouldShowWelcome = !welcomeShown && (
        !lastWelcomeTime || 
        (now - parseInt(lastWelcomeTime)) > 10 * 60 * 1000 // 10 minutes
      );

      setShowWelcome(shouldShowWelcome);
      setIsLoading(false);
    };

    checkWelcomeStatus();
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // Mark as shown in this session
    sessionStorage.setItem('welcomeShownThisSession', 'true');
    // Update last welcome time
    localStorage.setItem('lastWelcomeTime', Date.now().toString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return <Blog />;
};

export default Index;
