/**
 * Shown across the dashboard when Supabase is configured but not answering —
 * on the free tier, a project pauses after a week without traffic. The
 * dashboard is showing built-in content, so saving stays off until the
 * project is back.
 */
export function DatabaseUnreachableNotice() {
  return (
    <div
      role="alert"
      className="border-b border-danger/30 bg-danger-soft font-sans text-[14px] leading-[140%] text-ink"
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-baseline gap-x-[8px] gap-y-[2px] px-[16px] py-[10px] sm:px-[28px]">
        <p className="font-semibold text-danger">The database is paused or unreachable.</p>
        <p className="text-graphite">
          You&apos;re seeing the built-in content, and saving is off. Restore the project in
          the{" "}
          <a
            href="https://supabase.com/dashboard/projects"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-ink"
          >
            Supabase dashboard
          </a>
          , then reload this page.
        </p>
      </div>
    </div>
  );
}
