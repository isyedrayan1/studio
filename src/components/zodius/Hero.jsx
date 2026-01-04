import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Link from "next/link";

import { TiLocationArrow } from "react-icons/ti";

const Hero = () => {
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const mainVideoRef = useRef(null);

  // Handle audio toggle from navbar
  useEffect(() => {
    const handleAudioToggle = (e) => {
      setIsMuted(!e.detail.isPlaying);
    };
    const handlePauseToggle = (e) => {
      setIsPaused(e.detail.isPaused);
    };
    window.addEventListener('audioToggle', handleAudioToggle);
    window.addEventListener('videoPauseToggle', handlePauseToggle);
    return () => {
      window.removeEventListener('audioToggle', handleAudioToggle);
      window.removeEventListener('videoPauseToggle', handlePauseToggle);
    };
  }, []);

  // Handle video pause/play
  useEffect(() => {
    if (mainVideoRef.current) {
      if (isPaused) {
        mainVideoRef.current.pause();
      } else {
        mainVideoRef.current.play().catch(e => console.log("Hero video play blocked", e));
      }
    }
  }, [isPaused]);

  // Sync muted state with navbar audio toggle
  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = isMuted;
      if (!isMuted && mainVideoRef.current.paused) {
        mainVideoRef.current.play().catch(e => console.log("Hero video play blocked", e));
      }
    }
  }, [isMuted]);

  // Handle video load and hide loading screen
  const handleVideoLoad = () => {
    setLoading(false);
  };

  // Fallback: Hide loading after 2 seconds even if video doesn't load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-black pointer-events-none">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}
      <div className="relative h-dvh w-screen overflow-x-hidden">
        <div
          id="video-frame"
          className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
        >
          {/* Single background video - no carousel */}
          <video
            ref={mainVideoRef}
            src="/videos/ffsalvd.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />

          <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
            FF<b>S</b>AL
          </h1>
          <div className="absolute left-0 top-0 z-40 size-full">
            <div className="mt-24 px-5 sm:px-10">
              <h1 className="special-font hero-heading text-blue-100">
                Do<b>m</b>inate
              </h1>
              <p className="mb-3 max-w-80 font-robert-regular text-blue-100 text-base md:text-lg">
                Free Fire Students League <br /> The Ultimate Showcase of Skill
              </p>
              <p className="mb-5 max-w-96 font-circular-web text-sm md:text-base text-blue-100/80">
                Presented by <span className="text-yellow-300 font-semibold">Thinkbotz Association</span> • AIML Department<br />
                <span className="text-xs md:text-sm">Annamacharya Institute of Technology and Sciences, Kadapa</span>
              </p>
              <Link href="/leaderboard">
                <Button
                  id="enter-arena"
                  title="Enter Arena"
                  leftIcon={<TiLocationArrow />}
                  containerClass="bg-yellow-300 flex-center gap-1"
                />
              </Link>
            </div>
          </div>
        </div>
        <h1 className="special-font hero-heading absolute bottom-5 right-5 text-[#FF4646]">
          FF<b>S</b>AL
        </h1>
      </div>
    </>
  );
};

export default Hero;
