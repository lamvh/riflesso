"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useId, useState, type ReactNode } from "react";

import { plural } from "@/lib/dashboard/admin-changes";

/*
 * Dragging files from the Media grid onto a folder in the sidebar files them
 * there. Dragging a selected card carries the whole selection; any other
 * card goes alone. Mouse drags start after a few pixels and touch after a
 * short press, so clicks and scrolling behave as before. The keyboard path is
 * the card's Edit dialog or the bulk bar's Move to folder.
 */

type DragData = { keys: string[] };
type DropData = { folder: string };

/** Wraps the sidebar and the grid; `onDrop` gets the files and the target folder ('' = unfiled). */
export function MediaDragArea({
  onDrop,
  children,
}: {
  onDrop: (keys: string[], folder: string) => void;
  children: ReactNode;
}) {
  /* A stable id keeps dnd-kit's screen-reader hints identical on server and client. */
  const id = useId();
  const [dragging, setDragging] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
  );

  const onDragStart = ({ active }: DragStartEvent) =>
    setDragging((active.data.current as DragData | undefined)?.keys.length ?? 1);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    const keys = (active.data.current as DragData | undefined)?.keys;
    const target = over?.data.current as DropData | undefined;
    if (keys?.length && target) onDrop(keys, target.folder);
  };

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {dragging !== null && (
          <span className="pointer-events-none inline-flex h-[30px] items-center rounded-[8px] bg-ink px-[12px] font-sans text-[13px] font-medium text-paper shadow-[0_8px_24px_rgba(28,24,16,0.25)]">
            Move {plural(dragging, "file")}
          </span>
        )}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * Makes a card draggable. `keys` is what it carries: the selection when the
 * card is part of it, else the card's own file.
 */
export function useMediaCardDrag(key: string, keys: string[], disabled: boolean) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: `file:${key}`,
    data: { keys } satisfies DragData,
    disabled,
  });
  return {
    setNodeRef,
    /* The browser's own image drag would steal the gesture from dnd-kit. */
    dragProps: { ...listeners, onDragStartCapture: (event: { preventDefault: () => void }) => event.preventDefault() },
    isDragging,
  };
}

/** Makes a folder row a drop target; `folder` '' is Unfiled. */
export function useFolderDrop(folder: string, disabled: boolean) {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder:${folder}`,
    data: { folder } satisfies DropData,
    disabled,
  });
  return { setNodeRef, isOver };
}
