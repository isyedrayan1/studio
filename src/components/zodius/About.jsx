"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap/all";
import Image from "next/image";
import React from "react";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    // Set initial state before animation
    gsap.set('.mask-clip-path', {
      width: '24rem',
      height: '60vh',
      borderRadius: '1.5rem'
    });

    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.3,
        pin: true,
        pinSpacing: true,
      },
    });
    clipAnimation.to('.mask-clip-path', {
      width: '100vw',
      height: '100vh',
      borderRadius: 0
    })
  });
  return (
    <div id="about" className="min-h-screen w-screen bg-blue-50">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <h2 className="font-general text-sm uppercase md:text-[10px] lg:text-lg text-black">
          welcome to ffsal
        </h2>
        <AnimatedTitle title="Expe<b>r</b>ience the <b>u</b>ltimate <br /> comp<b>e</b>titive <b>a</b>ction" containerClass="mt-1 !text-black text-center"/>

        <div className="about-subtext">
          <p className="font-semibold text-black">Three days of intense Battle Royale competition</p>
          <p className="mt-2 text-black">FFSAL brings together the best student squads from across campus</p>
          <p className="mt-2 text-sm text-black opacity-70 italic font-general uppercase tracking-tighter">Organized by Thinkbotz Association • AIML Department • AITS Kadapa</p>
        </div>
        
      </div>
      <div className="relative h-dvh w-screen" id="clip">
          <div className="mask-clip-path about-image" style={{ width: '24rem', height: '60vh' }}>
            <Image
              src="/img/about.webp"
              alt="FFSAL Tournament"
              className="absolute left-0 top-0 w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 24rem, 30vw"
              priority
            />
          </div>
        </div>
    </div>
  );
};

export default About;
