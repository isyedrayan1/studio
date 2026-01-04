"use client";

import { motion } from "framer-motion";
import { Clock, Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchesInProgressProps {
  onViewMatches: () => void;
  completedCount?: number;
  totalCount?: number;
}

export function MatchesInProgress({ onViewMatches, completedCount = 0, totalCount = 4 }: MatchesInProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Animated Clock Icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8"
      >
        <div className="relative">
          <Clock className="h-24 w-24 text-yellow-300" />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-yellow-300/20"
          />
        </div>
      </motion.div>

      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-zentry uppercase text-white mb-4 tracking-wider text-center">
        Matches in Progress
      </h2>

      {/* Description */}
      <p className="text-lg text-gray-400 font-circular-web mb-10 max-w-lg text-center leading-relaxed">
        Final standings will be available after all matches are completed.
        <br />
        <span className="text-yellow-300">Check individual match results to see the action!</span>
      </p>

      {/* CTA Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          onClick={onViewMatches}
          className="flex items-center gap-3 px-8 py-6 bg-gradient-to-r from-yellow-300 to-yellow-400 text-black rounded-lg font-zentry text-lg uppercase tracking-wide shadow-lg hover:shadow-yellow-300/50 transition-all"
        >
          <Target className="h-6 w-6" />
          View Individual Match Results
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Progress Indicator */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            {Array.from({ length: totalCount }).map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  idx < completedCount 
                    ? "bg-green-500" 
                    : idx === completedCount 
                    ? "bg-yellow-500 animate-pulse" 
                    : "bg-gray-600"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 font-circular-web">
            {completedCount} of {totalCount} matches completed
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
