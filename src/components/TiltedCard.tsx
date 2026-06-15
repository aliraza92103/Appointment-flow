import React, { useState, useRef } from "react";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number; // Tilt strength factor (default 15)
  key?: any;
}

export default function TiltedCard({
  children,
  className = "",
  intensity = 15,
}: TiltedCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [shineX, setShineX] = useState(50);
  const [shineY, setShineY] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Direct percentages
    const dx = (mouseX / width) - 0.5; // -0.5 to 0.5
    const dy = (mouseY / height) - 0.5; // -0.5 to 0.5

    // Multiplied rotation angles
    setRotateY(dx * intensity); // Rotation around absolute Y-axis (tilt left/right)
    setRotateX(-dy * intensity); // Rotation around absolute X-axis (tilt up/down)

    // Position of simulated satin glass shine
    setShineX((mouseX / width) * 100);
    setShineY((mouseY / height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setShineX(50);
    setShineY(50);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden glass-card cursor-default ${className}`}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
        transition: isHovered
          ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)"
          : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
      id="interactive-tilted-glass-card"
    >
      {/* Glossy liquid glaze overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 0.45 : 0,
          background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 60%)`,
        }}
      />
      
      {/* Thin satin border reflections */}
      <div className="absolute inset-px rounded-[23px] pointer-events-none border border-white/5 bg-gradient-to-b from-white/10 to-transparent opacity-40 z-10" />

      {/* Actual Content */}
      <div className="relative z-20 w-full h-full">
        {children}
      </div>
    </div>
  );
}
