"use client";

import { useEffect, useRef } from "react";

/**
 * Rail videos play muted while on screen and pause once they leave, so a page
 * holding a dozen clips only decodes the few in view. The margin starts playback
 * slightly before the clip scrolls in.
 */
export function useVideoAutoplay() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Autoplay is only permitted for muted, inline video.
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    if (!("IntersectionObserver" in window)) {
      void video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return ref;
}
