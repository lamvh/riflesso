"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/*
 * Advances the hero banner on its own. The countdown restarts whenever the
 * slide changes, so picking a thumbnail gives that slide its full time. It
 * holds while a visitor is looking closely or can't see it:
 *   - the pointer is over the thumbnail strip (not the picture: the banner
 *     fills the screen, so a resting mouse is almost always on it), or keyboard
 *     focus is inside the banner;
 *   - the tab is in the background;
 *   - the banner has scrolled out of view;
 *   - the visitor asked for reduced motion (then it never runs).
 */

/** Whether autoplay should hold right now, from the banner's surroundings. */
function useAutoplayHold(
  root: RefObject<HTMLElement | null>,
  strip: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const el = root.current;
    const thumbs = strip.current;
    if (!enabled || !el) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setReducedMotion(motion.matches);
    const onVisibility = () => setHidden(document.hidden);
    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);
    /* Keyboard focus only: a clicked thumbnail keeps focus too, and that
       must not stop the banner for good. */
    const onFocusIn = (event: FocusEvent) =>
      setFocused((event.target as Element | null)?.matches(":focus-visible") ?? false);
    const onFocusOut = (event: FocusEvent) => {
      if (!el.contains(event.relatedTarget as Node | null)) setFocused(false);
    };
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      threshold: 0.25,
    });

    onMotion();
    onVisibility();
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    thumbs?.addEventListener("pointerenter", onEnter);
    thumbs?.addEventListener("pointerleave", onLeave);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    observer.observe(el);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      thumbs?.removeEventListener("pointerenter", onEnter);
      thumbs?.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
      observer.disconnect();
    };
  }, [root, strip, enabled]);

  return hovered || focused || hidden || offscreen || reducedMotion;
}

/**
 * Moves `setActive` to the next slide every `seconds` while `enabled`.
 * Returns a ref for the banner's root element.
 */
export function useHeroAutoplay<T extends HTMLElement>({
  strip,
  enabled,
  seconds,
  active,
  count,
  setActive,
}: {
  /** The thumbnail strip; hovering it holds the banner. */
  strip: RefObject<HTMLElement | null>;
  enabled: boolean;
  seconds: number;
  active: number;
  count: number;
  setActive: (next: number) => void;
}) {
  const root = useRef<T>(null);
  const running = enabled && count > 1;
  const held = useAutoplayHold(root, strip, running);

  useEffect(() => {
    if (!running || held) return;
    const timer = window.setTimeout(() => setActive((active + 1) % count), seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [running, held, active, count, seconds, setActive]);

  return root;
}

/** Scrolls the thumbnail strip sideways so the active thumbnail is in view. */
export function useKeepThumbnailInView(strip: RefObject<HTMLElement | null>, active: number) {
  const first = useRef(true);
  useEffect(() => {
    /* The page opens on slide one with the strip at its start; leave it be. */
    if (first.current) {
      first.current = false;
      return;
    }
    const el = strip.current;
    const thumb = el?.children[active] as HTMLElement | undefined;
    if (!el || !thumb) return;
    const box = el.getBoundingClientRect();
    const rect = thumb.getBoundingClientRect();
    const left = el.scrollLeft + rect.left - box.left - (el.clientWidth - rect.width) / 2;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "auto" });
  }, [strip, active]);
}
