"use client";

import { useState, useEffect } from "react";
import { analyzeUserTechStack } from "../lib/github";

interface UseTechStackResult {
  techStack: string[];
  loading: boolean;
  error: string | null;
}

export const useTechStack = (username: string): UseTechStackResult => {
  const [techStack, setTechStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechStack = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await analyzeUserTechStack(username);
        setTechStack(result);
      } catch (err) {
        console.error("Failed to analyze tech stack:", err);
        setError(
          err instanceof Error ? err.message : "Failed to analyze tech stack"
        );
        // Fallback to hardcoded tech stack on error
        setTechStack([
          "TypeScript",
          "JavaScript",
          "Python",
          "React",
          "Next.js",
          "Unity",
          "PyTorch",
          "React Native",
          "Machine Learning",
          "Game Development",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStack();
  }, [username]);

  return { techStack, loading, error };
};
