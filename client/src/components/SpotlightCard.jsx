import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function SpotlightCard({ children, className = '', glowColor = 'rgba(52, 211, 153, 0.06)', tilt = false, ...props }) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2deg", "2deg"]);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setPosition({ x: mouseX, y: mouseY });
    
    if (tilt) {
      const xPct = mouseX / rect.width - 0.5;
      const yPct = mouseY / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
    }
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    if (tilt) {
      x.set(0);
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformStyle: tilt ? "preserve-3d" : "flat",
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`
        }}
      />
      {/* Wrapper to ensure children stay above the spotlight glow */}
      <div 
        className="relative z-10 h-full w-full"
        style={{ transform: tilt ? "translateZ(20px)" : "none" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
