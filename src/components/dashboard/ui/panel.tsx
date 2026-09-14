import type { ReactNode } from "react";

/** A white sheet on the grey canvas, with an optional title bar. */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-[20px]",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`min-w-0 rounded-[2px] border border-line bg-paper ${className}`}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-[20px] py-[14px]">
          <div className="min-w-0">
            <h2 className="font-sans text-[17px] leading-[120%] font-bold tracking-[-0.4px]">
              {title}
            </h2>
            {description && (
              <p className="mt-[3px] font-sans text-[13px] leading-[140%] text-graphite">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
