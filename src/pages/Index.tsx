"use client";

import { useState, useEffect } from "react";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import Blog from "./Blog";

const Index = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasVisited, setHasVisited] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem("hasVisitedBlog");
    if (visited === "true") {
      setShowWelcome(false);
      setHasVisited(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setHasVisited(true);
    localStorage.setItem("hasVisitedBlog", "true");
  };

  if (showWelcome && !hasVisited) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return <Blog />;
};

export default Index;
