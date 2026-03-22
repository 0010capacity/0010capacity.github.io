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

const SnowfallContext = createContext<SnowfallContextValue>({
  isEnabled: true,
  toggle: () => {},
});

export function useSnowfall() {
  return useContext(SnowfallContext);
}

export function SnowfallProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(SNOWFALL_ENABLED_KEY);
    if (stored !== null) {
      setIsEnabled(stored === "true");
    }
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

  return (
    <SnowfallContext.Provider value={{ isEnabled, toggle }}>
      {children}
    </SnowfallContext.Provider>
  );
}
