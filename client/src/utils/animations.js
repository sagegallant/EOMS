/**
 * animations.js
 * GSAP + Lenis utilities for EOMS v2.1
 * Provides: useCountUp, useScrollReveal, useLenis, staggerReveal
 */
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────
   Lenis Singleton
───────────────────────────────────────── */
let lenisInstance = null;

export function initLenis() {
  if (lenisInstance) { lenisInstance.destroy(); }
  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  // Connect Lenis to GSAP ticker for synchronization
  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Connect to ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update);

  return lenisInstance;
}

export function destroyLenis() {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

/**
 * useLenis — initializes Lenis on mount, tears down on unmount.
 * Call once at the AppShell level.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = initLenis();
    return () => { destroyLenis(); };
  }, []);
}

/* ─────────────────────────────────────────
   useCountUp — animates a number from 0 to target
   Usage: const ref = useCountUp(98, { suffix: '%', duration: 1.2 })
───────────────────────────────────────── */
export function useCountUp(target, { suffix = '', prefix = '', duration = 1.0, delay = 0.1 } = {}) {
  const ref = useRef(null);
  const obj = useRef({ val: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const isFloat = String(target).includes('.');
    obj.current.val = 0;

    const tween = gsap.to(obj.current, {
      val: target,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        const v = isFloat ? obj.current.val.toFixed(1) : Math.round(obj.current.val);
        el.textContent = `${prefix}${v}${suffix}`;
      },
      onComplete: () => {
        el.textContent = `${prefix}${target}${suffix}`;
      },
    });

    return () => tween.kill();
  }, [target, suffix, prefix, duration, delay]);

  return ref;
}

/* ─────────────────────────────────────────
   useScrollReveal — fades + slides element in on viewport entry
   Usage: const ref = useScrollReveal({ delay: 0.1 })
───────────────────────────────────────── */
export function useScrollReveal({ delay = 0, y = 16, once = true } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    gsap.set(el, { opacity: 0, y });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay,
          ease: 'power2.out',
        });
      },
    });

    return () => trigger.kill();
  }, [delay, y, once]);

  return ref;
}

/* ─────────────────────────────────────────
   useStaggerReveal — stagger-reveals a list of children
   Usage: const containerRef = useStaggerReveal({ stagger: 0.08 })
───────────────────────────────────────── */
export function useStaggerReveal({ stagger = 0.07, y = 12, delay = 0 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const children = ref.current.children;
    if (!children.length) return;

    gsap.set(children, { opacity: 0, y });

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger,
          delay,
          ease: 'power2.out',
        });
      },
    });

    return () => trigger.kill();
  }, [stagger, y, delay]);

  return ref;
}

/* ─────────────────────────────────────────
   useMetricPillFill — animates MetricPillBar fill width
   Usage: const ref = useMetricPillFill(72) // 72%
───────────────────────────────────────── */
export function useMetricPillFill(pct, delay = 0.15) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: pct / 100,
        duration: 1.0,
        delay,
        ease: 'power3.out',
        transformOrigin: 'left center',
      }
    );
  }, [pct, delay]);

  return ref;
}

/* ─────────────────────────────────────────
   useProgressBarFill — for horizontal bar fills
───────────────────────────────────────── */
export function useProgressBarFill(pct, delay = 0.1) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { width: '0%' },
      { width: `${pct}%`, duration: 0.9, delay, ease: 'power2.out' }
    );
  }, [pct, delay]);

  return ref;
}
