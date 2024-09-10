import React from 'react'

export const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='w-full items-center font-semibold text-md flex'>
            <div className='w-1/3 rounded-full h-[2px] bg-gradient-to-r from-background to-accent' />
            <div className='w-1/3 text-center text-neutral4'>
                {children}
            </div>
            <div className='w-1/3 rounded-full h-[2px] bg-gradient-to-l from-background to-accent' />
        </div>
    )
}
