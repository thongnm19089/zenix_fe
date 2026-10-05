import React, { useRef, useState, useEffect } from 'react';

// 1. A reusable wrapper component you can put around ANYTHING
export default function AutoHeightTransition({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!innerRef.current) return;
    
    // ResizeObserver watches the DOM element and fires whenever its size changes
    const observer = new ResizeObserver((entries) => {
      // Get the new exact pixel height of the inner content
      const newHeight = entries[0].contentRect.height;
      setHeight(newHeight);
    });

    observer.observe(innerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    // The Outer Div: Animates the height and hides whatever is shrinking
    <div 
      style={{ height: height === 'auto' ? 'auto' : `${height}px` }} 
      className="transition-[height] duration-500 ease-in-out overflow-hidden"
    >
      {/* The Inner Div: Exists purely to be measured by the observer */}
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  );
}
