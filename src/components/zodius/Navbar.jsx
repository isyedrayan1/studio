"use client";
import React, { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";
import gsap from "gsap";
import Link from "next/link";

const Navbar = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const { y: currentScrollY } = useWindowScroll();

  useEffect(() => {
    if(currentScrollY === 0){
      setIsNavVisible(true)
      navContainerRef.current.classList.remove('floating-nav')
    }else if (currentScrollY > lastScrollY){
      setIsNavVisible(false)
      navContainerRef.current.classList.add('floating-nav')
    }else if(currentScrollY < lastScrollY){
      setIsNavVisible(true)
      navContainerRef.current.classList.add('floating-nav')
    }

    setLastScrollY(currentScrollY)
  }, [currentScrollY, lastScrollY]);

  useEffect(()=>{
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.3
    })
  }, [isNavVisible])

  const navContainerRef = useRef(null);
  const audioElementRef = useRef(null);

  const toggleAudioIndicator = () => {
    const newState = !isAudioPlaying;
    setIsAudioPlaying(newState);
    setIsIndicatorActive(newState);
    // Dispatch custom event to sync with other components (like Hero video)
    window.dispatchEvent(new CustomEvent('audioToggle', { detail: { isPlaying: newState } }));
  };

  const toggleVideoPause = () => {
    const newState = !isVideoPaused;
    setIsVideoPaused(newState);
    window.dispatchEvent(new CustomEvent('videoPauseToggle', { detail: { isPaused: newState } }));
  };

  useEffect(() => {
    // We strictly use video audio now as requested.
    // The bars in the navbar still animate, but no separate audio track plays.
    if (audioElementRef.current) {
        audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  const navItems = [
    {
      title: "Schedule",
      path: "/schedule",
    },
    {
      title: "Leaderboard",
      path: "/leaderboard",
    },
    {
      title: "Contact",
      path: "/#contact",
    },
  ];

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <h1 className="font-zentry text-4xl md:text-5xl font-black text-blue-50 hover:text-yellow-300 transition-colors">
              FFSAL
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.path}
                className="nav-hover-btn"
              >
                {item.title}
              </Link>
            ))}
            
            {/* Desktop Login Buttons */}
            <div className="flex items-center gap-3 ml-4">
              <Link
                href="/login?role=admin"
                className="px-4 py-2 text-xs uppercase font-general bg-blue-50 text-black rounded hover:bg-yellow-300 transition-colors"
              >
                Admin
              </Link>
              <Link
                href="/login?role=associate"
                className="px-4 py-2 text-xs uppercase font-general bg-yellow-300 text-black rounded hover:bg-blue-50 transition-colors"
              >
                Associate
              </Link>
            </div>

            {/* Play/Pause Button */}
            <button
              className="ml-4 flex items-center text-blue-50 hover:text-yellow-300 transition-colors"
              onClick={toggleVideoPause}
              aria-label={isVideoPaused ? "Play video" : "Pause video"}
            >
              {isVideoPaused ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>

            {/* Audio Indicator */}
            <button
              className="ml-2 flex items-center space-x-0.5"
              onClick={toggleAudioIndicator}
              aria-label="Toggle audio"
            >
              <audio
                src="/audio/loop.mp3"
                ref={audioElementRef}
                className="hidden"
                loop
                muted
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`indicator-line ${
                    isIndicatorActive ? "active" : ""
                  }`}
                  style={{ animationDelay: `${bar * 0.2}s` }}
                ></div>
              ))}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              className="flex flex-col gap-1.5 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`w-6 h-0.5 bg-blue-50 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-blue-50 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-blue-50 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>

            {/* Mobile Play/Pause Button */}
            <button
              className="flex items-center text-blue-50"
              onClick={toggleVideoPause}
              aria-label={isVideoPaused ? "Play video" : "Pause video"}
            >
              {isVideoPaused ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>

            {/* Mobile Audio Indicator */}
            <button
              className="flex items-center space-x-0.5"
              onClick={toggleAudioIndicator}
              aria-label="Toggle audio"
            >
              <audio
                src="/audio/loop.mp3"
                ref={audioElementRef}
                className="hidden"
                loop
                muted
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`indicator-line ${
                    isIndicatorActive ? "active" : ""
                  }`}
                  style={{ animationDelay: `${bar * 0.2}s` }}
                ></div>
              ))}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-4 mx-4 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
            <div className="flex flex-col p-4">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.path}
                  className="py-3 px-4 text-blue-50 hover:bg-white/10 rounded transition-colors font-general uppercase text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              
              {/* Mobile Login Buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                <Link
                  href="/login?role=admin"
                  className="py-3 px-4 text-center text-black bg-blue-50 rounded font-general uppercase text-sm hover:bg-yellow-300 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
                <Link
                  href="/login?role=associate"
                  className="py-3 px-4 text-center text-black bg-yellow-300 rounded font-general uppercase text-sm hover:bg-blue-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Associate Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
