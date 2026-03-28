import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const cursorRef = useRef(null);
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

            // Update main trailing glow
            if (cursorRef.current) {
                // centered by offsetting half of the width/height (assuming 400x400)
                const offsetX = smoothMouse.current.x - 200;
                const offsetY = smoothMouse.current.y - 200;
                cursorRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
            }

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
            {/* The main trailing glowing blob */}
            <div 
                ref={cursorRef}
                className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 blur-[80px]"
                style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, rgba(20,184,166,0.2) 40%, rgba(0,0,0,0) 70%)',
                    willChange: 'transform'
                }}
            />
            
            {/* The immediate small following dot */}
            <div 
                ref={cursorDotRef}
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-emerald-400 opacity-40 shadow-[0_0_10px_2px_rgba(16,185,129,0.3)]"
                style={{ willChange: 'transform' }}
            />
        </div>
    );
}
