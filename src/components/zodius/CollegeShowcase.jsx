import React from 'react'
import Image from 'next/image'

const CollegeShowcase = () => {
  return (
    <section id="college" className="bg-white h-dvh w-screen flex flex-col items-center justify-center py-10 overflow-hidden">
        <div className="container mx-auto px-5 md:px-10 flex flex-col items-center justify-between h-full max-w-7xl">
            {/* Top Label */}
            <p className="font-general text-sm uppercase md:text-xs tracking-widest text-black/60 mb-4">Hosted with Pride at</p>
            
            {/* Massive Logo Container */}
            <div className="relative w-full flex-grow flex items-center justify-center px-4 md:px-0">
                <div className="relative w-full h-full max-h-[50vh] flex items-center justify-center">
                    <img 
                        src="/img/logo1.PNG" 
                        alt="Annamacharya Institute of Technology and Sciences" 
                        className="w-full h-full object-contain pointer-events-none"
                    />
                </div>
            </div>

            {/* Bottom Details Section */}
            <div className="w-full mt-8 border-t border-black/10 pt-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                    {/* Left: Event Info - 70% */}
                    <div className="flex flex-col items-center md:items-start flex-1 md:pr-8">
                        <span className="text-5xl md:text-6xl lg:text-7xl font-zentry font-black text-primary leading-none">
                            3 DAYS ESPORTS EVENT
                        </span>
                        <p className="font-circular-web text-sm md:text-base text-black/70 max-w-xl mt-4 text-center md:text-left">
                            An intense three-day tournament featuring 18 teams competing for glory, prizes, and the ultimate bragging rights.
                        </p>
                    </div>
                    
                    {/* Divider */}
                    <div className="hidden md:block w-[1px] bg-black/10 self-stretch"></div>
                    
                    {/* Right: Association - 30% */}
                    <div className="flex flex-col items-center md:items-end">
                        <span className="text-4xl md:text-5xl font-zentry font-black text-primary leading-none">THINKBOTZ</span>
                        <span className="text-xs uppercase text-gray-500 font-general tracking-widest mt-2">Association AIML</span>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="font-circular-web text-sm md:text-base text-black/60 max-w-2xl mx-auto italic">
                        "Empowering student gamers and building the next generation of esports athletes through excellence and competition."
                    </p>
                </div>
            </div>
        </div>
    </section>
  )
}

export default CollegeShowcase
