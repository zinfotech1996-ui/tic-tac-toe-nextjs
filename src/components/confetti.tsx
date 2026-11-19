"use client";

import { useEffect, useRef } from "react";

export type Burst = {
  id: number;
  x: number;
  y: number;
};

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  spin: number;
  wobble: number;
  color: string;
};

const COLORS = ["#2a63d4", "#e0456f", "#f6c945", "#4f9d7a", "#2c2723"];

export function Confetti({ burst }: { burst: Burst | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!burst) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces: Piece[] = Array.from({ length: 150 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
      const speed = 7 + Math.random() * 10;

      return {
        x: burst.x + (Math.random() - 0.5) * 50,
        y: burst.y + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed * (0.65 + Math.random() * 0.75),
        vy: Math.sin(angle) * speed,
        width: 4 + Math.random() * 6,
        height: 8 + Math.random() * 8,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.42,
        wobble: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    });

    let frame = 0;

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, width, height);

      const fade =
        frame > 115 ? Math.max(0, 1 - (frame - 115) / 65) : 1;
      let alive = false;

      for (const piece of pieces) {
        piece.vy += 0.24;
        piece.vx *= 0.992;
        piece.vy *= 0.997;
        piece.x += piece.vx + Math.sin(piece.wobble + frame * 0.12) * 1.15;
        piece.y += piece.vy;
        piece.rotation += piece.spin;

        if (piece.y < height + 40) alive = true;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.globalAlpha = fade;
        ctx.fillStyle = piece.color;
        ctx.fillRect(
          -piece.width / 2,
          -piece.height / 2,
          piece.width,
          piece.height,
        );
        ctx.restore();
      }

      if (alive && frame < 220) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      ctx.clearRect(0, 0, width, height);
    };
  }, [burst]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
