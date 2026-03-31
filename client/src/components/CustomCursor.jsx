import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const cursorDotRef = useRef(null);
    
    // Position targets directly updated by mouse event
    const mouse = useRef({ x: 0, y: 0 });
    
    // Interpolated positions for smoothing
    const smoothMouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // Track mouse position directly
        const manageMouseMove = (e) => {
            mouse.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        window.addEventListener("mousemove", manageMouseMove);

        // Animation Loop
        let animationFrameId;

        const render = () => {
            // Lerp formulation: current = current + (target - current) * factor
            smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.15;
            smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.15;


            // Update small immediate dot
            if (cursorDotRef.current) {
                // Assuming 8x8 dot
                const dotOffsetX = mouse.current.x - 4;
                const dotOffsetY = mouse.current.y - 4;
                cursorDotRef.current.style.transform = `translate3d(${dotOffsetX}px, ${dotOffsetY}px, 0)`;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("mousemove", manageMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Return nothing on small screens (CSS hides it anyway) or handle it strictly via CSS media queries
    return (
        <div className="hidden lg:block pointer-events-none fixed inset-0 z-100 overflow-hidden mix-blend-screen">

            {/* The immediate small following dot */}
            <div 
                ref={cursorDotRef}
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-400 opacity-40 shadow-[0_0_10px_2px_rgba(16,185,129,0.3)]"
                style={{ willChange: 'transform' }}
            />
        </div>
    );
}
