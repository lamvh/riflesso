"use client";

import type { ContactCardRecord } from "@/lib/content/site-content-types";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";

import { OutlineButton, Switch } from "./ui/controls";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { PanelHeading } from "./ui/panel-heading";

/** The About/Contact grid: offices with their address, and the enquiry lines. */
export function SettingsContactCards({
  contacts,
  dispatch,
}: {
  contacts: ContactCardRecord[];
  dispatch: (action: AdminAction) => void;
}) {
  return (
    <div className="min-w-0">
      <PanelHeading
        title="Contact cards"
        note="The grid on About and Contact, in this order"
        action={
          <OutlineButton onClick={() => dispatch({ type: "contact/add" })}>
            + Add card
          </OutlineButton>
        }
      />

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {contacts.map((card, index) => {
          const set = (patch: Partial<ContactCardRecord>) =>
            dispatch({ type: "contact/set", index, patch });

          return (
            <div key={card.id} className="flex flex-col gap-[14px] border border-ink px-[16px] py-[14px]">
              <div className="flex items-center gap-[6px]">
                <div className="flex min-w-0 flex-1 flex-col">
                  <NameInput
                    value={card.heading}
                    placeholder="e.g. Ho Chi Minh City"
                    onChange={(heading) => set({ heading })}
                  />
                </div>
                <OutlineButton small onClick={() => dispatch({ type: "contact/move", index, delta: -1 })}>
                  ↑
                </OutlineButton>
                <OutlineButton small onClick={() => dispatch({ type: "contact/move", index, delta: 1 })}>
                  ↓
                </OutlineButton>
                <OutlineButton small onClick={() => dispatch({ type: "contact/remove", index })}>
                  ✕
                </OutlineButton>
              </div>

              <div className="grid grid-cols-2 gap-[14px]">
                <LabelledField label="Address · one line per row">
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
              </div>

              <LabelledField label="Sentence before the email">
                <ProseInput
                  value={card.lead}
                  placeholder="For bookings please contact"
                  onChange={(lead) => set({ lead })}
                />
              </LabelledField>

              <div className="grid grid-cols-2 gap-[14px]">
                <LabelledField label="Link label">
                  <ProseInput
                    value={card.linkLabel}
                    placeholder="Submit your Portfolio Here"
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
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-rule pt-[12px]">
                <p className="font-serif text-[14px] leading-none text-dim">
                  {card.contactOnly ? "Contact page only" : "Shown on About and Contact"}
                </p>
                <Switch
                  on={!card.contactOnly}
                  label={`Show ${card.heading || "this card"} on About`}
                  onClick={() => set({ contactOnly: !card.contactOnly })}
                />
              </div>
            </div>
          );
        })}

        {contacts.length === 0 && (
          <p className="py-[16px] font-serif text-[15px] leading-[120%] text-dim">
            No contact cards — About and Contact will show no grid.
          </p>
        )}
      </div>
    </div>
  );
}
