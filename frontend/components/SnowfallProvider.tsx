"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const SNOWFALL_ENABLED_KEY = "snowfall-enabled";

interface SnowfallContextValue {
  isEnabled: boolean;
  toggle: () => void;
}

const SnowfallContext = createContext<SnowfallContextValue | null>(null);

export function useSnowfall() {
  const context = useContext(SnowfallContext);
  if (!context) {
    throw new Error("useSnowfall must be used within SnowfallProvider");
  }
  return context;
}

export function SnowfallProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SNOWFALL_ENABLED_KEY);
    if (stored !== null) {
      setIsEnabled(stored === "true");
    }
    setIsInitialized(true);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem(SNOWFALL_ENABLED_KEY, String(newValue));
      }
      return newValue;
    });
  }, []);

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <SnowfallContext.Provider value={{ isEnabled, toggle }}>
      {children}
    </SnowfallContext.Provider>
  );
}
