"use client";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useId, type CSSProperties, type ReactNode } from "react";

import { GripIcon } from "./icons";

const STRATEGY = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};

/**
 * Drag-and-drop ordering for a list, a strip or a grid. Mouse drags start after
 * a few pixels (so a click is still a click), touch after a short press (so a
 * swipe still scrolls), and the keyboard works too: focus the handle, Space,
 * arrows, Space. The up/down buttons beside rows stay as the plain fallback.
 */
export function SortableList({
  ids,
  onReorder,
  layout = "vertical",
  children,
}: {
  ids: string[];
  onReorder: (from: number, to: number) => void;
  layout?: keyof typeof STRATEGY;
  children: ReactNode;
}) {
  /* A stable id keeps dnd-kit's screen-reader hints identical on server and client. */
  const id = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onReorder(from, to);
  };

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={STRATEGY[layout]}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/**
 * Wire one item into the list. Spread `itemProps` on the element that moves;
 * spread `handleProps` on whatever starts the drag — a handle, or the item.
 */
export function useSortableItem(id: string) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };
  return {
    itemProps: { ref: setNodeRef, style },
    handleProps: { ...attributes, ...listeners },
    dragging: isDragging,
  };
}

/** The six-dot grip a row is dragged by. */
export function DragHandle({
  label,
  handleProps,
}: {
  label: string;
  handleProps: ReturnType<typeof useSortableItem>["handleProps"];
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title="Drag to reorder"
      {...handleProps}
      className="flex h-[28px] w-[18px] shrink-0 cursor-grab touch-none items-center justify-center rounded-[4px] text-line-strong transition-colors hover:bg-hover hover:text-graphite active:cursor-grabbing"
    >
      <GripIcon size={14} />
    </button>
  );
}

/** Lift styling for the row being dragged. */
export const draggingClass = (dragging: boolean) =>
  dragging ? "shadow-lift ring-1 ring-line-strong bg-paper" : "";

/**
 * A list row (or card) that can be dragged. `children` receives the handle
 * props, to spread on a DragHandle or on the row's own surface.
 */
export function SortableItem({
  id,
  as: Tag = "li",
  className = "",
  children,
}: {
  id: string;
  as?: "li" | "div";
  className?: string;
  children: (sortable: {
    handleProps: ReturnType<typeof useSortableItem>["handleProps"];
    dragging: boolean;
  }) => ReactNode;
}) {
  const { itemProps, handleProps, dragging } = useSortableItem(id);
  return (
    <Tag {...itemProps} className={`${className} ${draggingClass(dragging)}`}>
      {children({ handleProps, dragging })}
    </Tag>
  );
}
