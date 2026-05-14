import React from 'react';
import Spline from '@splinetool/react-spline';

export function Background3D() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full scale-[1.5] md:scale-125 transition-transform duration-1000">
        <Spline 
          scene="https://prod.spline.design/dfjZmOVTmjrryNLj/scene.splinecode" 
          className="w-full h-full"
        />
      </div>
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
    </div>
  );
}
