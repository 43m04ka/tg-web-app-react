import {useCallback, useEffect, useRef, useState} from 'react';
import {hapticSelection} from '../lib/haptic';

export function useCarouselTrack() {
    const trackRef = useRef(null);
    const activeRef = useRef(0);
    const frameRef = useRef(0);
    const [active, setActive] = useState(0);

    const sync = useCallback(() => {
        const track = trackRef.current;
        const slides = track ? Array.from(track.children) : [];
        if (!slides.length) return;

        const origin = slides[0].offsetLeft;
        let nearest = 0;
        let best = Infinity;

        slides.forEach((slide, index) => {
            const distance = Math.abs(slide.offsetLeft - origin - track.scrollLeft);
            if (distance < best) {
                best = distance;
                nearest = index;
            }
        });

        if (nearest === activeRef.current) return;

        activeRef.current = nearest;
        setActive(nearest);
        hapticSelection();
    }, []);

    const handleScroll = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(sync);
    }, [sync]);

    useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

    const scrollToSlide = useCallback((index) => {
        const track = trackRef.current;
        const slide = track?.children[index];
        if (!slide) return;

        track.scrollTo({left: slide.offsetLeft - track.children[0].offsetLeft, behavior: 'smooth'});
    }, []);

    return {trackRef, active, handleScroll, scrollToSlide};
}
