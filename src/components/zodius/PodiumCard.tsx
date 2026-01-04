"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PodiumCardProps {
  teamName: string;
  totalPoints: number;
  totalKills: number;
  wins: number;
  rank: number;
}

export default function PodiumCard({ teamName, totalPoints, totalKills, wins, rank }: PodiumCardProps) {
  const podiumRef = useRef<HTMLDivElement>(null);
  const index = rank - 1; // Convert rank to 0-based index

  useEffect(() => {
    const element = podiumRef.current;
    if (!element) return;

    // GSAP scroll-triggered animation
    const animation = gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 50,
        scale: 0.9,
      },
      {
        opacity: 1,
        y: 0,
        scale: index === 0 ? 1.1 : 1,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      animation.kill();
    };
  }, [index]);

  return (
    <div 
      ref={podiumRef}
      className={`relative flex flex-col items-center p-8 ${
        index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
      }`}
    >
      {/* Rank Badge */}
      <div className={`absolute -top-4 w-12 h-12 rounded-full flex items-center justify-center font-zentry text-2xl font-black ${
        index === 0 ? 'bg-yellow-300 text-black' : 
        index === 1 ? 'bg-gray-300 text-black' : 
        'bg-yellow-600 text-white'
      }`}>
        {rank}
      </div>

      {/* Team Name */}
      <h3 className={`mt-6 font-zentry text-3xl md:text-4xl font-black text-center mb-4 ${
        index === 0 ? 'text-yellow-300' : 
        index === 1 ? 'text-gray-300' : 
        'text-yellow-600'
      }`}>
        {teamName}
      </h3>

      {/* Stats */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="font-general text-sm uppercase text-gray-400">Points</span>
          <span className="font-zentry text-2xl font-black text-primary">{totalPoints}</span>
        </div>
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="font-general text-sm uppercase text-gray-400">Kills</span>
          <span className="font-zentry text-xl font-black text-red-500">{totalKills}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-general text-sm uppercase text-gray-400">Wins</span>
          <span className="font-zentry text-xl font-black text-accent">{wins}</span>
        </div>
      </div>
    </div>
  );
}
