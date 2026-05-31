"use client";

import { useEffect, useRef, useMemo } from "react";

type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "mist";

interface WeatherParticlesProps {
  condition: WeatherCondition;
  intensity?: "light" | "medium" | "heavy";
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  wind: number;
  wobble?: number;
  wobbleSpeed?: number;
}

export default function WeatherParticles({
  condition,
  intensity = "medium",
}: WeatherParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const particleCount = useMemo(() => {
    const counts = { light: 20, medium: 50, heavy: 80 };
    return counts[intensity];
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Init particles
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, canvas.height, condition)
    );

    function createParticle(
      w: number,
      h: number,
      cond: WeatherCondition
    ): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h - h,
        speed: cond === "snow" ? 0.5 + Math.random() * 1.5 : 4 + Math.random() * 8,
        size: cond === "snow" ? 2 + Math.random() * 4 : cond === "rain" || cond === "drizzle" ? 1 + Math.random() * 1.5 : 0,
        opacity: 0.1 + Math.random() * 0.5,
        wind: -1 + Math.random() * 2,
        wobble: cond === "snow" ? Math.random() * Math.PI * 2 : 0,
        wobbleSpeed: cond === "snow" ? 0.01 + Math.random() * 0.03 : 0,
      };
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (const p of particles) {
        if (condition === "snow") {
          p.y += p.speed;
          p.wobble! += p.wobbleSpeed!;
          p.x += Math.sin(p.wobble!) * 0.5 + p.wind * 0.3;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        } else if (condition === "rain" || condition === "drizzle") {
          p.y += p.speed;
          p.x += p.wind * 0.5;

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.wind * 0.5, p.y + (condition === "drizzle" ? 6 : 12));
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
          ctx.lineWidth = p.size;
          ctx.stroke();
        }

        // Reset particle when out of bounds
        if (p.y > canvas.height || p.x < -20 || p.x > canvas.width + 20) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    if (
      condition === "rain" ||
      condition === "drizzle" ||
      condition === "snow"
    ) {
      animate();
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [condition, intensity, particleCount]);

  if (condition !== "rain" && condition !== "drizzle" && condition !== "snow") {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: condition === "drizzle" ? 0.5 : 0.8 }}
    />
  );
}
