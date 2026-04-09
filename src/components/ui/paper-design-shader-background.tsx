'use client';

import { GrainGradient } from '@paper-design/shaders-react';

export function GradientBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <GrainGradient
        style={{ height: '100%', width: '100%' }}
        colorBack="hsl(238, 78%, 98%)"
        softness={0.76}
        intensity={0.45}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1.2}
        rotation={0}
        speed={0.5}
        colors={['hsl(238, 78%, 79%)', 'hsl(30, 100%, 75%)', 'hsl(340, 82%, 92%)']}
      />
    </div>
  );
}

export default GradientBackground;
