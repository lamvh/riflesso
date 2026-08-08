"use client";

import { useEffect, useRef } from "react";

/** Pointer travel (px) past which a gesture counts as a drag, not a click. */
const DRAG_THRESHOLD = 3;

/**
 * Click-and-drag horizontal scrolling for the media rails.
 *
 * Move/up are bound to the window rather than the rail so a drag that leaves the
 * element still tracks. The capture-phase click handler swallows the click that
 * fires at the end of a drag, otherwise every drag would also navigate.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) moved = true;
      el.scrollLeft = startScrollLeft - delta;
    };

    const onPointerUp = () => {
      dragging = false;
      el.style.cursor = "grab";
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!moved) return;
      event.preventDefault();
      event.stopPropagation();
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  return ref;
}
