import { Fragment } from "react";

import type { ContactCardRecord } from "@/lib/content/site-content-types";

const UNDERLINED = "border-b border-ink";
const BODY = "font-serif text-[15px] leading-[135%]";

function ContactCardBlock({ card }: { card: ContactCardRecord }) {
  const { tel, lead, email, linkLabel, linkHref } = card;
  const address = card.address.filter(Boolean);
  const hasLink = Boolean(linkLabel && linkHref);
  const hasDetails = Boolean(tel || lead || email || hasLink);

  return (
    <div className="flex flex-col gap-[14px]">
      <h3 className="font-sans text-[24px] leading-[95%] font-bold tracking-[-1.2px]">
        {card.heading}
      </h3>

      {address.length > 0 && (
        <p className={BODY}>
          {address.map((line, index) => (
            <Fragment key={`${line}-${index}`}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      )}

      {hasDetails && (
        <p className={BODY}>
          {tel && (
            <>
              {tel}
              <br />
            </>
          )}
          {lead && `${lead} `}
          {email && (
            <a href={`mailto:${email}`} className={UNDERLINED}>
              {email}
            </a>
          )}
          {hasLink && (
            <a href={linkHref} className={UNDERLINED}>
              {linkLabel}
            </a>
          )}
        </p>
      )}
    </div>
  );
}

type ContactGridProps = {
  cards: ContactCardRecord[];
  /** About reuses this grid but drops the cards marked Contact only. */
  variant: "about" | "contact";
};

export function ContactGrid({ cards, variant }: ContactGridProps) {
  const shown = cards.filter((card) => variant === "contact" || !card.contactOnly);
  if (!shown.length) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-10 gap-y-[70px] px-5 pt-[90px]">
      {shown.map((card) => (
        <ContactCardBlock key={card.id} card={card} />
      ))}
    </div>
  );
}
