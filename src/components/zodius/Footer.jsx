import React from 'react'
import Link from 'next/link'

const Footer = () => {
  return (
    <footer className='w-screen bg-violet-300 py-8 font-circular-web'> 
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-6'>
            {/* Brand Section */}
            <div className='flex flex-col items-center md:items-start'>
              <h3 className='font-zentry text-3xl font-black mb-2 text-black'>FFSAL</h3>
              <p className='text-sm text-center md:text-left text-white'>Free Fire Students Association League</p>
            </div>
            
            {/* Quick Links */}
            <div className='flex flex-col items-center'>
              <h4 className='font-semibold mb-3 text-sm uppercase tracking-wider text-black'>Quick Links</h4>
              <div className='flex flex-col gap-2 text-sm'>
                <Link href="/leaderboard" className='text-white hover:text-black transition-colors'>
                  Leaderboard
                </Link>
                <Link href="/schedule" className='text-white hover:text-black transition-colors'>
                  Schedule
                </Link>
                <Link href="/bracket" className='text-white hover:text-black transition-colors'>
                  Bracket
                </Link>
              </div>
            </div>
            
            {/* Info Section */}
            <div className='flex flex-col items-center md:items-end text-center md:text-right'>
              <h4 className='font-semibold mb-3 text-sm uppercase tracking-wider text-black'>Organized By</h4>
              <p className='text-sm font-semibold text-white'>Thinkbotz Association</p>
              <p className='text-xs mt-1 text-white'>AIML Department</p>
              <p className='text-xs text-white'>AITS, Kadapa</p>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className='border-t border-black/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-center text-sm text-white'>&copy; FFSAL 2026. All rights reserved.</p>
            <p className='text-center text-xs text-white'>
              Developed by{' '}
              <a 
                href="https://instagram.com/isyedrayan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-black transition-colors font-semibold"
              >
                Rayan
              </a>
              {' '}and{' '}
              <a 
                href="https://instagram.com/itsnaseersyed" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-black transition-colors font-semibold"
              >
                Naseer
              </a>
            </p>
          </div>
        </div>
    </footer>
  )
}

export default Footer