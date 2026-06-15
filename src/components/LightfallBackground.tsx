import { useEffect, useRef } from "react";

interface LightfallBackgroundProps {
  speedFactor?: number;
  streakCount?: number;
}

export default function LightfallBackground({
  speedFactor = 0.8,
  streakCount = 75,
}: LightfallBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Streaks configuration
    const colors = ["#25D366", "#4da3ff", "#00ff88"];
    
    interface Streak {
      x: number;
      y: number;
      speed: number;
      length: number;
      width: number;
      color: string;
      alpha: number;
      depth: number; // Perspective factor
    }

    const streaks: Streak[] = [];

    const createStreak = (initYAtTop = false): Streak => {
      const depth = Math.random() * 0.8 + 0.2; // 0.2 to 1.0 (perspective size/speed)
      return {
        x: Math.random() * width,
        y: initYAtTop ? -Math.random() * height : Math.random() * height,
        speed: (Math.random() * 4 + 3) * speedFactor * depth,
        length: (Math.random() * 80 + 40) * depth,
        width: (Math.random() * 2 + 1) * depth,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.4 + 0.3,
        depth,
      };
    };

    // Initialize list of streaks
    for (let i = 0; i < streakCount; i++) {
      streaks.push(createStreak(false));
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const draw = () => {
      // Clear with very slight transparency to leave a subtle motion trail
      ctx.fillStyle = "rgba(11, 15, 20, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // WebGL/Neon glow style tunnel effect
      // Add subtle radial gradient to simulate "dark tunnel" center glow
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.max(width, height) * 0.8;
      const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
      gradient.addColorStop(0, "rgba(11, 15, 20, 0)");
      gradient.addColorStop(0.5, "rgba(11, 15, 20, 0.3)");
      gradient.addColorStop(1, "rgba(8, 12, 16, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render perspective grid lines (the "dark tunnel" rings/grid)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      
      // Draw grid tunnels
      for (let scale = 0.1; scale <= 1.2; scale += 0.15) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, (width / 2) * scale, (height / 2) * scale, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw perspective vanishing rays
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.stroke();
      }

      // Draw streaks moving from top to bottom
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];

        // Draw light streak
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineWidth = s.width;

        // Create glowing radial effect for neon feel
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.length);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.2, s.color);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = grad;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);

        // Add glow shadow configuration on streak
        ctx.shadowBlur = 10 * s.depth;
        ctx.shadowColor = s.color;
        
        ctx.stroke();
        
        // Reset shadow so it doesn't degrade performance for normal renderings
        ctx.shadowBlur = 0;

        // Update position
        s.y += s.speed;

        // Wrap around when it falls below bottom
        if (s.y > height) {
          streaks[i] = createStreak(true);
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speedFactor, streakCount]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      id="lightfall-webgl-background"
    />
  );
}
