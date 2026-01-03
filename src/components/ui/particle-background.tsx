"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  speed?: number;
  className?: string;
}

export function ParticleBackground({
  particleCount = 50,
  colors = ["#FF4646", "#29ABE2", "#EAB308", "#FFFFFF"],
  minSize = 2,
  maxSize = 6,
  speed = 1,
  className = "",
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const createParticle = useCallback((id: number, width: number, height: number): Particle => ({
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * (maxSize - minSize) + minSize,
    speedX: (Math.random() - 0.5) * speed,
    speedY: (Math.random() - 0.5) * speed,
    opacity: Math.random() * 0.5 + 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }), [colors, maxSize, minSize, speed]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setParticles(
        Array.from({ length: particleCount }, (_, i) =>
          createParticle(i, dimensions.width, dimensions.height)
        )
      );
    }
  }, [dimensions, particleCount, createParticle]);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const interval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;

          // Wrap around screen edges
          if (newX < 0) newX = dimensions.width;
          if (newX > dimensions.width) newX = 0;
          if (newY < 0) newY = dimensions.height;
          if (newY > dimensions.height) newY = 0;

          return { ...particle, x: newX, y: newY };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [dimensions]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          animate={{
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Floating Ember Particles (Fire themed)
interface EmberParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function EmberParticles({ count = 30 }: { count?: number }) {
  const [embers, setEmbers] = useState<EmberParticle[]>([]);

  useEffect(() => {
    setEmbers(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        size: 2 + Math.random() * 4,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full bg-gradient-to-t from-primary via-orange-500 to-yellow-400"
          style={{
            left: `${ember.x}%`,
            width: ember.size,
            height: ember.size,
            bottom: -10,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(ember.id) * 50],
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.3],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Grid Pattern Background
export function GridBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,70,70,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,70,70,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,70,70,0.1) 0%, transparent 50%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Animated Lines Background
export function AnimatedLines({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Horizontal scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{
          top: ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Vertical scanning line */}
      <motion.div
        className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent to-transparent"
        animate={{
          left: ["0%", "100%"],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
          delay: 2,
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-8 right-8 w-20 h-20 border-r-2 border-t-2 border-accent/30" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l-2 border-b-2 border-accent/30" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
}

// Spotlight Effect
export function SpotlightEffect({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,70,70,0.15) 0%, transparent 40%)",
      }}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Noise Texture Overlay
export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}
