import { Fragment } from "react";

import type { ContactCardRecord } from "@/lib/content/site-content-types";
import { staggerStyle } from "@/lib/stagger-style";

const UNDERLINED = "border-b border-ink";
const BODY = "font-serif text-[15px] leading-[135%]";

/** wa.me wants the bare international number: "+84 90-123 4567" → "84901234567". */
const whatsappHref = (number: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}`;

function ContactCardBlock({
  card,
  index,
  delay,
}: {
  card: ContactCardRecord;
  index: number;
  delay: number;
}) {
  const { tel, lead, email, linkLabel, linkHref } = card;
  /* Only a number wa.me can dial gets a line. */
  const whatsapp = /\d{6,}/.test(card.whatsapp.replace(/\D/g, ""))
    ? card.whatsapp.trim()
    : "";
  const address = card.address.filter(Boolean);
  const hasLink = Boolean(linkLabel && linkHref);
  const hasDetails = Boolean(tel || whatsapp || lead || email || hasLink);

  return (
    <div
      className="rfl-intro flex flex-col gap-[14px]"
      style={staggerStyle(index * 2, delay)}
    >
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
          {whatsapp && (
            <>
              <a
                href={whatsappHref(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className={UNDERLINED}
              >
                WhatsApp {whatsapp}
              </a>
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
  /** Seconds the cards wait before rising, so they can follow copy above them. */
  delay?: number;
};

export function ContactGrid({ cards, variant, delay = 0 }: ContactGridProps) {
  const shown = cards.filter(
    (card) => variant === "contact" || !card.contactOnly,
  );
  if (!shown.length) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-10 gap-y-[70px] px-5 pt-[90px]">
      {shown.map((card, index) => (
        <ContactCardBlock
          key={card.id}
          card={card}
          index={index}
          delay={delay}
        />
      ))}
    </div>
  );
}
