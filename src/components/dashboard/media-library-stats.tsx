import { formatBytes } from "@/lib/media/media-library-types";

/** The four headline numbers above the Media screen. */
export function MediaLibraryStats({
  files,
  bucket,
  totals,
}: {
  /** Null while the bucket is still listing (or failed to). */
  files: number | null;
  bucket: string | null;
  totals: { all: number; used: number; usedBytes: number; unused: number; unusedBytes: number };
}) {
  const stats = [
    { label: "Files", value: files === null ? "—" : String(files), note: bucket ? `In bucket ${bucket}` : "Listing…" },
    { label: "Total size", value: formatBytes(totals.all), note: "Everything stored" },
    { label: "In use", value: String(totals.used), note: formatBytes(totals.usedBytes) },
    {
      label: "Unused",
      value: String(totals.unused),
      note: totals.unused ? `${formatBytes(totals.unusedBytes)} could be freed` : "Nothing wasted",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-[10px] border border-line bg-paper shadow-sheet px-[16px] py-[14px] font-sans">
          <p className="text-[13px] leading-none text-graphite">{stat.label}</p>
          <p className="mt-[10px] font-serif text-[30px] leading-none tracking-[-0.5px] tabular-nums">{stat.value}</p>
          <p className="mt-[8px] truncate text-[12px] leading-none text-graphite">{stat.note}</p>
        </div>
      ))}
    </div>
  );
}
