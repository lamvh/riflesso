import { Fragment } from "react";

import { CONTACT_CARDS, type ContactCard } from "@/data/contact-offices";

const UNDERLINED = "border-b border-ink";
const BODY = "font-serif text-[15px] leading-[135%]";

function ContactCardBlock({ card }: { card: ContactCard }) {
  const { address, tel, lead, email, link } = card;
  const hasDetails = Boolean(tel || lead || email || link);

  return (
    <div className="flex flex-col gap-[14px]">
      <h3 className="font-sans text-[24px] leading-[95%] font-bold tracking-[-1.2px]">
        {card.heading}
      </h3>

      {address && (
        <p className={BODY}>
          {address.map((line, index) => (
            <Fragment key={line}>
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
          {link && (
            <a href={link.href} className={UNDERLINED}>
              {link.label}
            </a>
          )}
        </p>
      )}
    </div>
  );
}

type ContactGridProps = {
  /** About reuses this grid but drops the Brand Partnerships card. */
  variant: "about" | "contact";
};

export function ContactGrid({ variant }: ContactGridProps) {
  const cards = CONTACT_CARDS.filter(
    (card) => variant === "contact" || !card.contactOnly,
  );

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-10 gap-y-[70px] px-5 pt-[90px]">
      {cards.map((card) => (
        <ContactCardBlock key={card.heading} card={card} />
      ))}
    </div>
  );
}
