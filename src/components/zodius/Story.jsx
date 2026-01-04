"use client";
import { useRef } from "react";
import AnimatedTitle from "./AnimatedTitle";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import RoundedCorners from "./RoundedCorners";
import Button from "./Button";

const Story = () => {
  const frameRef = useRef(null);

  const handleMouseLeave = () => {
    const element = frameRef.current;

    gsap.to(element, {
      duration: 0.3,
      rotateX: 0,
      rotateY: 0,
      ease: "power1.inOut",
    });
  };
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const element = frameRef.current;

    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -20;
    const rotateY = ((x - centerX) / centerX) * -20;

    gsap.to(element, {
      duration: 0.3,
      rotateX,
      rotateY,
      transformPrespective: 500,
      ease: "power1.inOut",
    });
  };
  return (
    <section id="story" className="min-h-dvh w-screen bg-black text-blue-50">
      <div className="flex size-full flex-col items-center py-10 pb-24">
        <p className="font-general text-sm uppercase md:text-[10px]">
          the path to victory
        </p>
        <div className="relative size-full ">
          <AnimatedTitle
            title={`The jo<b>u</b>rney to <br /> bec<b>o</b>me ch<b>a</b>mpions`}
            sectionId="#story"
            containerClass="mt-5 pointer-events-none mix-blend-difference relative z-50"
          />

          <div className="story-img-container">
            <div className="story-img-mask">
              <div className="story-img-content">
                <Image
                  ref={frameRef}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={handleMouseLeave}
                  onMouseUp={handleMouseLeave}
                  onMouseMove={handleMouseMove}
                  src="/img/entrance.webp"
                  alt="FFSAL Tournament Arena"
                  className="object-contain"
                  fill
                />
              </div>
            </div>
            <RoundedCorners />
          </div>
        </div>
        <div className="-mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end relative z-50">
          <div className="flex h-full w-fit flex-col items-center md:items-start">
            <p className="mt-3 max-w-sm text-center font-circular-web text-violet-50 md:text-start">
              From intense qualifiers to the grand finals, every match brings you closer to glory. 
              Compete with the best, showcase your skills, and etch your name in FFSAL history.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/schedule">
                <Button
                  id="schedule-button"
                  title="view schedule"
                  containerClass="bg-white"
                />
              </Link>
              <Link href="/leaderboard">
                <Button
                  id="leaderboard-button"
                  title="live rankings"
                  containerClass="bg-yellow-300"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
