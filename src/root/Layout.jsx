import GlassSurface from '@/components/GlassSurface'
import React from 'react'

export default function Layout({children}) {
  return (
    <div className='h-screen flex w-full'>
        {/* side menu */}
        <div className="grid bg-amber-900 w-[270px] ">
dfdfd
        </div>
      <div className="grid flex-1">
        {/* header */}
        <GlassSurface width={'100%'} className='bg-red-500' height={100}>
 
        {/* <div className="flex w-full h-full bg-amb er-500"> */}
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
            sdsd
        {/* </div> */}
        </GlassSurface>

        {/* content */}
      <div className=" overflow-y-auto">

      {children}
      </div>
      </div>
    </div>
  )
}
