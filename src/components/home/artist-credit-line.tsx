import type { ArtistCredit } from "@/lib/media-item";

/** Artist name in bold grotesque, disciplines trailing in serif. */
export function ArtistCreditLine({ name, roles }: ArtistCredit) {
  return (
    <p className="leading-[92%]">
      <strong className="font-sans text-[14px] font-bold tracking-[-0.5px]">
        {name}
      </strong>{" "}
      <span className="font-serif text-[14px] leading-[95%] tracking-[-0.28px]">
        {roles}
      </span>
    </p>
  );
}
