// Framer Motion centralized variants

// Page transition: subtle fade and slide up
export const pageTransition = {
    initial: { opacity: 0, y: 15 },
    animate: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
        opacity: 0, 
        y: -15, 
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
};

// Container for staggering children
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Entry animation for cards or sections
export const cardEntry = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

// Button interaction variants
export const buttonTap = {
    hover: { scale: 1.01, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    tap: { scale: 0.98, transition: { duration: 0.2, ease: "easeOut" } }
};

// Scroll Reveal variants
export const scrollReveal = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};

export const scrollRevealLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
        opacity: 1, 
        x: 0, 
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};

export const scrollRevealRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
        opacity: 1, 
        x: 0, 
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
};
