"use client";

import { motion, type Variants, type HTMLMotionProps } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

// ============================================
// Animation Variants
// ============================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// ============================================
// Motion Components
// ============================================

interface MotionDivProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function FadeInUp({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInDown({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInDown}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInLeft({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInLeft}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function FadeInRight({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInRight}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={scaleIn}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className, ...props }: MotionDivProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Special Effects Components
// ============================================

interface GlowingTextProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowingText({ children, className, glowColor = "primary" }: GlowingTextProps) {
  const glowStyles: Record<string, string> = {
    primary: "drop-shadow-[0_0_25px_rgba(255,70,70,0.5)]",
    accent: "drop-shadow-[0_0_25px_rgba(41,171,226,0.5)]",
    gold: "drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]",
  };

  return (
    <motion.span
      className={cn(glowStyles[glowColor], className)}
      animate={{
        textShadow: [
          "0 0 20px rgba(255,70,70,0.3)",
          "0 0 40px rgba(255,70,70,0.6)",
          "0 0 20px rgba(255,70,70,0.3)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  distance?: number;
}

export function FloatingElement({ 
  children, 
  className, 
  duration = 3, 
  delay = 0,
  distance = 15 
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface PulsingBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: "primary" | "accent" | "gold";
}

export function PulsingBorder({ children, className, color = "primary" }: PulsingBorderProps) {
  const colors = {
    primary: "rgba(255,70,70,",
    accent: "rgba(41,171,226,",
    gold: "rgba(234,179,8,",
  };

  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        boxShadow: [
          `0 0 0 2px ${colors[color]}0.3)`,
          `0 0 0 4px ${colors[color]}0.1), 0 0 20px ${colors[color]}0.4)`,
          `0 0 0 2px ${colors[color]}0.3)`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Animated Counter - Live Data Aware
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 1.5, 
  className,
  suffix = "",
  prefix = ""
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [prevValue, setPrevValue] = React.useState(value);
  const ref = React.useRef<HTMLSpanElement>(null);

  // Observe visibility
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate when visible or value changes
  React.useEffect(() => {
    if (!isVisible) return;
    
    const startValue = prevValue;
    const endValue = value;
    const difference = endValue - startValue;
    
    if (difference === 0) {
      setDisplayValue(value);
      return;
    }
    
    const steps = 50;
    const stepDuration = (duration * 1000) / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + difference * easeOutQuart);
      
      setDisplayValue(currentValue);
      
      if (currentStep >= steps) {
        setDisplayValue(endValue);
        clearInterval(timer);
      }
    }, stepDuration);
    
    setPrevValue(value);
    
    return () => clearInterval(timer);
  }, [value, isVisible, duration, prevValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

// ============================================
// Reveal on Scroll
// ============================================

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

export function RevealOnScroll({ 
  children, 
  className, 
  direction = "up",
  delay = 0 
}: RevealOnScrollProps) {
  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        delay,
        ease: [0.22, 1, 0.36, 1] 
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Magnetic Button Effect
// ============================================

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
}

export function Magnetic({ children, className }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - left - width / 2) / 5;
    const y = (clientY - top - height / 2) / 5;
    ref.current!.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    ref.current!.style.transform = "translate(0px, 0px)";
  };

  return (
    <motion.div
      ref={ref}
      className={cn("transition-transform duration-200", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Text Reveal Animation
// ============================================

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
  return (
    <motion.div className={cn("overflow-hidden", className)}>
      <motion.span
        className="inline-block"
        initial={{ y: "100%" }}
        whileInView={{ y: 0 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.8, 
          delay,
          ease: [0.22, 1, 0.36, 1] 
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}

// ============================================
// Parallax Section
// ============================================

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className, speed = 0.5 }: ParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const { top } = ref.current.getBoundingClientRect();
        setOffset(top * speed);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transform: `translateY(${offset}px)` }}
    >
      {children}
    </motion.div>
  );
}
