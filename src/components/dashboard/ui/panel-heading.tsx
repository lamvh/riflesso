import type { ReactNode } from "react";

/** Title, the sentence under it, and an optional action, over a black rule. */
export function PanelHeading({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-5 border-b border-ink pb-[12px]">
      <div>
        <h2 className="font-sans text-[22px] leading-[95%] font-bold tracking-[-1.1px]">
          {title}
        </h2>
        {note && (
          <p className="mt-[7px] font-serif text-[15px] leading-none text-dim">{note}</p>
        )}
      </div>
      {action}
    </div>
  );
}
