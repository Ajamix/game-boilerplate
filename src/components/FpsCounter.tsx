import React, { useEffect, useState } from 'react';

/**
 * A lightweight FPS counter component that displays in the top-right corner of the screen.
 */
export const FpsCounter: React.FC = () => {
  const [fps, setFps] = useState<number>(0);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let frameId: number;
    
    const updateFps = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      
      // Update FPS every 500ms for smoother reading
      if (elapsed >= 500) {
        // Calculate FPS and round to integer
        const calculatedFps = Math.round((frameCount * 1000) / elapsed);
        setFps(calculatedFps);
        
        // Reset counters
        frameCount = 0;
        lastTime = currentTime;
      }
      
      // Request next frame
      frameId = requestAnimationFrame(updateFps);
    };
    
    // Start FPS measurement
    frameId = requestAnimationFrame(updateFps);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: fps > 50 ? '#4CAF50' : fps > 30 ? '#FFC107' : '#F44336',
        padding: '5px 10px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
}; 