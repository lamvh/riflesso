"use client";

import { useState } from "react";

import type { ContactCardRecord } from "@/lib/content/site-content-types";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";

import { Button, IconButton, StatusPill } from "./ui/controls";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, CrossIcon, PlusIcon } from "./ui/icons";
import { Panel } from "./ui/panel";
import { SwitchRow } from "./ui/switch-row";

/** First line of the address, else the email or phone: enough to recognise a card. */
const summaryOf = (card: ContactCardRecord) =>
  [card.address.find((line) => line.trim()), card.email, card.tel]
    .filter(Boolean)
    .slice(0, 2)
    .join(", ") || "No details yet";

/**
 * The About/Contact grid as a list of collapsed cards. A card opens to edit;
 * a card with no heading yet — one just added — opens on its own.
 */
export function SettingsContactCards({
  contacts,
  dispatch,
}: {
  contacts: ContactCardRecord[];
  dispatch: (action: AdminAction) => void;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const remove = (index: number) => {
    const heading = contacts[index].heading || "this card";
    if (window.confirm(`Remove ${heading} from the contact grid?`)) {
      dispatch({ type: "contact/remove", index });
    }
  };

  return (
    <Panel
      title="Contact cards"
      description="Shown on About and Contact, in this order"
      action={
        <Button size="sm" onClick={() => dispatch({ type: "contact/add" })}>
          <PlusIcon />
          Add card
        </Button>
      }
      bodyClassName=""
    >
      <ul>
        {contacts.map((card, index) => {
          const open = openIds.has(card.id) || !card.heading.trim();
          const set = (patch: Partial<ContactCardRecord>) =>
            dispatch({ type: "contact/set", index, patch });

          return (
            <li key={card.id} className="border-b border-line last:border-b-0">
              <div className="flex items-center gap-[8px] px-[16px] py-[10px]">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(card.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-[10px] text-left"
                >
                  <ChevronDownIcon
                    className={`shrink-0 text-graphite transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-[15px] leading-[125%] font-bold tracking-[-0.3px]">
                      {card.heading || "Untitled card"}
                    </span>
                    <span className="mt-[2px] block truncate font-serif text-[14px] leading-[130%] text-graphite">
                      {summaryOf(card)}
                    </span>
                  </span>
                </button>

                {card.contactOnly && <StatusPill tone="neutral">Contact page only</StatusPill>}

                <div className="flex shrink-0">
                  <IconButton
                    label={`Move ${card.heading || "card"} up`}
                    disabled={index === 0}
                    onClick={() => dispatch({ type: "contact/move", index, delta: -1 })}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    label={`Move ${card.heading || "card"} down`}
                    disabled={index === contacts.length - 1}
                    onClick={() => dispatch({ type: "contact/move", index, delta: 1 })}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    label={`Remove ${card.heading || "card"}`}
                    tone="danger"
                    onClick={() => remove(index)}
                  >
                    <CrossIcon />
                  </IconButton>
                </div>
              </div>

              {open && (
                <div className="grid gap-[14px] border-t border-line bg-[#fafaf9] px-[16px] py-[16px] sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <LabelledField label="Heading">
                      <NameInput
                        value={card.heading}
                        placeholder="Ho Chi Minh City"
                        onChange={(heading) => set({ heading })}
                      />
                    </LabelledField>
                  </div>
                  <LabelledField label="Address" hint="One line per row">
                    <ProseTextarea
                      rows={4}
                      value={card.address.join("\n")}
                      placeholder={"42 Nguyen Hue Boulevard, District 1\nHo Chi Minh City"}
                      onChange={(text) => set({ address: text.split("\n") })}
                    />
                  </LabelledField>
                  <div className="flex flex-col gap-[14px]">
                    <LabelledField label="Phone">
                      <ProseInput value={card.tel} placeholder="Tel +84 …" onChange={(tel) => set({ tel })} />
                    </LabelledField>
                    <LabelledField label="Email">
                      <ProseInput
                        value={card.email}
                        placeholder="hello@riflesso.studio"
                        onChange={(email) => set({ email })}
                      />
                    </LabelledField>
                  </div>
                  <div className="sm:col-span-2">
                    <LabelledField label="Sentence before the email">
                      <ProseInput
                        value={card.lead}
                        placeholder="For bookings please contact"
                        onChange={(lead) => set({ lead })}
                      />
                    </LabelledField>
                  </div>
                  <LabelledField label="Link text">
                    <ProseInput
                      value={card.linkLabel}
                      placeholder="Submit your portfolio"
                      onChange={(linkLabel) => set({ linkLabel })}
                    />
                  </LabelledField>
                  <LabelledField label="Link address">
                    <ProseInput
                      value={card.linkHref}
                      placeholder="https://…"
                      onChange={(linkHref) => set({ linkHref })}
                    />
                  </LabelledField>
                  <div className="sm:col-span-2">
                    <SwitchRow
                      title="Show on About"
                      note={card.contactOnly ? "Only the Contact page lists this card" : "Listed on About and Contact"}
                      on={!card.contactOnly}
                      onToggle={() => set({ contactOnly: !card.contactOnly })}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {contacts.length === 0 && (
        <p className="px-[20px] py-[18px] font-sans text-[14px] leading-[150%] text-graphite">
          No contact cards. About and Contact show no grid until you add one.
        </p>
      )}
    </Panel>
  );
}
