import { useEffect, useRef } from 'react';
import { useScroll, useSpring } from 'motion/react';
import { animeAnimations } from '../utils/animations.js';

export function useScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });
    return scaleX;
}

export function useScrollAnimation(animationType = 'fade-in', delay = 0) {
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Trigger animation based on type
                        switch (animationType) {
                            case 'fade-in':
                                animeAnimations.fadeIn(entry.target, delay);
                                break;
                            case 'slide-left':
                                animeAnimations.slideInLeft(entry.target, delay);
                                break;
                            case 'slide-right':
                                animeAnimations.slideInRight(entry.target, delay);
                                break;
                            case 'scale-up':
                                animeAnimations.scaleUp(entry.target, delay);
                                break;
                            case 'stagger':
                                animeAnimations.stagger(entry.target, delay);
                                break;
                            default:
                                animeAnimations.fadeIn(entry.target, delay);
                        }

                        // Only animate once
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [animationType, delay]);

    return ref;
}
