'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const BootScreenContext = createContext();

export function useBootScreen() {
  return useContext(BootScreenContext);
}

export function BootScreenProvider({ children }) {
  const [bootScreenComplete, setBootScreenComplete] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(false);

  useEffect(() => {
    // Check if boot screen was already shown in this session
    const hasSeenBootScreen = sessionStorage.getItem('filmmela-boot-screen');
    
    if (!hasSeenBootScreen) {
      setShowBootScreen(true);
      
      // Mark as shown in session storage
      sessionStorage.setItem('filmmela-boot-screen', 'true');
      
      // Hide boot screen after animation completes
      const timer = setTimeout(() => {
        setShowBootScreen(false);
        setTimeout(() => setBootScreenComplete(true), 800); // Wait for fade out transition
      }, 4200);
      
      return () => clearTimeout(timer);
    } else {
      // If already shown, mark as complete immediately
      setBootScreenComplete(true);
    }
  }, []);

  return (
    <BootScreenContext.Provider value={{ bootScreenComplete, showBootScreen }}>
      {children}
    </BootScreenContext.Provider>
  );
}
