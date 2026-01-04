import Image from "next/image"
import Link from "next/link"
import Button from "./Button"

const ImageClipBox = ({src, clipClass}) => {
    return (
        <div className={`${clipClass}`}>
                <Image src={src} alt={src} fill />
        </div>
    )
}

const Contact = () => {
  return (
    <div id='contact' className='my-20 min-h-96 w-screen px-4 md:px-10'>
        <div className='relative rounded-lg bg-black py-24 text-blue-50 overflow-hidden'>
            {/* Background Images - Lower z-index */}
            <div className='absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96 z-0 opacity-20'>
                <ImageClipBox src="/img/contact-1.webp" clipClass="size-64 contact-clip-path-1" />
                <ImageClipBox src="/img/contact-2.webp" clipClass="contact-clip-path-2 translate-y-60 lg:translate-y-40 size-64" />
            </div>
            <div className='absolute left-1/2 -translate-x-1/2 -top-60 w-60 hidden sm:block sm:top-1/2 sm:left-20 sm:translate-x-0 md:left-auto md:right-10 lg:top-40 lg:w-80 z-0 opacity-20 transition-all duration-500'>
                <ImageClipBox src="/img/swordman-partial.webp" clipClass="absolute size-64 hidden md:block md:scale-125" />
                <ImageClipBox src="/img/swordman.webp" clipClass="sword-man-clip-path size-64 md:scale-125" />
            </div>
            
            {/* Text Content - Higher z-index with shadow */}
            <div className="relative z-10 flex flex-col items-center text-center px-4">
                <p className="font-general text-[10px] md:text-xs uppercase tracking-wider" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Join the Battle</p>
                <p className="special-font mt-10 w-full font-zentry text-4xl sm:text-5xl leading-[0.9] md:text-[6rem] max-w-4xl" style={{textShadow: '0 4px 8px rgba(0,0,0,0.6)'}}>
                  Be part of <br /> the <b>n</b>ew <b>e</b>ra of <br /> e-sp<b>o</b>rts t<b>o</b>day
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
                  <Link href="/leaderboard">
                    <Button title="View Leaderboard" containerClass="cursor-pointer bg-blue-50" />
                  </Link>
                  <Link href="/schedule">
                    <Button title="Check Schedule" containerClass="cursor-pointer bg-yellow-300" />
                  </Link>
                  <Link href="mailto:support@ffsal.com">
                    <Button 
                        title="Contact Us" 
                        containerClass="cursor-pointer bg-blue-50 !text-sm" 
                    />
                  </Link>
                </div>
                <div className="mt-10 text-center max-w-2xl">
                  <p className="font-circular-web text-sm md:text-base text-blue-100/90" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    Three days of intense competition • Multiple game modes • Top teams advance
                  </p>
                  <p className="font-circular-web text-xs md:text-sm text-blue-100/70 mt-2" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    Organized by Thinkbotz Association, AIML Department
                  </p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Contact