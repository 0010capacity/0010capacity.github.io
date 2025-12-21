"use client";

import { useEffect, useRef } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  drift: number;
}

export default function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ensure the canvas overlays the entire viewport (no Tailwind dependency)
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.right = "0";
    canvas.style.bottom = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999";

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let snowflakes: Snowflake[] = [];

    const resizeCanvas = () => {
      // Match device pixels for crispness
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createSnowflakes = () => {
      // Use CSS px (viewport) dimensions for simulation coordinates
      const w = window.innerWidth;
      const h = window.innerHeight;

      const count = Math.floor((w * h) / 15000);
      snowflakes = [];

      for (let i = 0; i < count; i++) {
        snowflakes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.2,
          opacity: Math.random() * 0.3 + 0.1,
          drift: Math.random() * 0.5 - 0.25,
        });
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      snowflakes.forEach(flake => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.01) * 0.3;

        if (flake.y > h) {
          flake.y = -flake.radius;
          flake.x = Math.random() * w;
        }

        if (flake.x > w) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = w;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createSnowflakes();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createSnowflakes();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Keep SSR/CSR markup stable; styling is applied in useEffect (client only)
  return <canvas ref={canvasRef} aria-hidden="true" />;
}
