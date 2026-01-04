import React from 'react'

interface ButtonProps {
  title: string;
  id: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  containerClass?: string;
}

const Button = ({title, id, rightIcon, leftIcon, containerClass}: ButtonProps) => {
  return (
    <button id={id} className={`group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full px-7 py-3 text-black flex items-center gap-2 ${containerClass || ''}`}>
        {leftIcon}
        <span className='relative inline-flex overflow-hidden font-general text-xs uppercase'>
          {title}
        </span>
        {rightIcon}
    </button>
  )
}

export default Button
