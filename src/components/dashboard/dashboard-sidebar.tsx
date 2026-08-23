"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  VIEWS,
  VIEW_HREF,
  VIEW_LABEL,
  adminTotals,
  navCount,
  viewFromPath,
} from "@/lib/dashboard/admin-views";

import { useAdmin } from "./admin-store";

/**
 * The wordmark is the locked asset at its locked dimensions. The design sets
 * the brand as type; here it stays the picture the rest of the site uses.
 */
const WORDMARK_WIDTH = 116;
const WORDMARK_HEIGHT = 20;

export function DashboardSidebar() {
  const { state } = useAdmin();
  const pathname = usePathname();
  const current = viewFromPath(pathname);
  const totals = adminTotals(state);

  return (
    <aside className="fixed top-0 left-0 z-[5] flex h-svh w-[236px] flex-col border-r border-ink bg-paper">
      <div className="border-b border-ink px-[20px] pt-[22px] pb-[18px]">
        <Link href="/" className="flex">
          <Image
            src="/riflesso.png"
            alt="Riflesso"
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
            priority
            className="h-[20px] w-auto"
          />
        </Link>
        <p className="mt-[6px] font-serif text-[14px] leading-none text-dim">
          Content admin
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-[2px] overflow-y-auto p-[10px]">
        {VIEWS.map((view) => {
          const active = view === current;
          return (
            <Link
              key={view}
              href={VIEW_HREF[view]}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-between gap-2 p-[10px] ${
                active ? "bg-ink text-paper" : "bg-transparent text-ink"
              }`}
            >
              <span className="font-sans text-[14px] leading-[92%] font-bold tracking-[-0.5px]">
                {VIEW_LABEL[view]}
              </span>
              <span className="font-sans text-[11px] leading-none font-bold opacity-60">
                {navCount(view, totals)}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-[4px] border-t border-rule px-[20px] py-[16px]">
        <p className="font-sans text-[13px] leading-none font-bold tracking-[-0.4px]">
          Diego Nguyen
        </p>
        <p className="font-serif text-[13px] leading-none text-dim">
          Editor · Ho Chi Minh City
        </p>
      </div>
    </aside>
  );
}
