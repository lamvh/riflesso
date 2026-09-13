"use client";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { ArtistDraft } from "@/lib/dashboard/admin-state";
import { TERRITORIES, type CategoryRow } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { Chip, SolidButton, Switch, UnderlineButton } from "./ui/controls";
import { Drawer } from "./ui/drawer";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { ImagePickButton } from "./ui/image-pick";

export function ArtistDrawer({
  draft,
  index,
  categories,
  dispatch,
}: {
  draft: ArtistDraft;
  /** -1 when the drawer is creating rather than editing. */
  index: number;
  categories: CategoryRow[];
  dispatch: (action: AdminAction) => void;
}) {
  const set = (patch: Partial<ArtistDraft>) => dispatch({ type: "draft/set", patch });
  const close = () => dispatch({ type: "drawer/close" });

  return (
    <Drawer
      title={index >= 0 ? "Edit details" : "New artist"}
      width={460}
      onClose={close}
    >
      <LabelledField label="Artist name">
        <NameInput
          value={draft.name}
          onChange={(name) => set({ name })}
          placeholder="e.g. Diego Nguyen"
        />
      </LabelledField>

      <LabelledField label="Categories (multi-select)" gap={9}>
        <div className="flex flex-wrap gap-[6px]">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              active={draft.categoryIds.includes(cat.id)}
              onClick={() => dispatch({ type: "draft/toggleCat", id: cat.id })}
            />
          ))}
        </div>
      </LabelledField>

      <LabelledField label="Territory" gap={9}>
        <div className="flex gap-[6px]">
          {TERRITORIES.map((territory) => (
            <Chip
              key={territory}
              label={territory}
              active={draft.territory === territory}
              onClick={() => set({ territory })}
            />
          ))}
        </div>
      </LabelledField>

      <LabelledField label="Portrait" gap={9}>
        <div className="flex items-start gap-[12px]">
          <div className="h-[120px] w-[96px] shrink-0 overflow-hidden bg-well">
            <CoverImage src={draft.image} pos="50% 22%" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
            <ProseInput
              value={draft.image}
              onChange={(image) => set({ image })}
              placeholder="/assets/… or https://…"
            />
            <ImagePickButton
              onPick={(image) => set({ image })}
              className="flex h-[40px] items-center justify-center border border-dashed border-ink bg-shell font-sans text-[12px] leading-none font-bold tracking-[-0.3px]"
            >
              Preview a file
            </ImagePickButton>
            <p className="font-serif text-[13px] leading-[120%] text-dim">
              Portrait JPG, at least 1400px wide. A picked file only previews —
              storage isn&apos;t connected yet, so publish with an image address.
            </p>
          </div>
        </div>
      </LabelledField>

      <LabelledField label="Bio">
        <ProseTextarea
          value={draft.bio}
          onChange={(bio) => set({ bio })}
          placeholder="A short paragraph shown on the artist page."
        />
      </LabelledField>

      <div className="flex items-center justify-between gap-4 border-t border-b border-rule py-[14px]">
        <div>
          <p className="font-sans text-[14px] leading-none font-bold tracking-[-0.5px]">
            Show in directory
          </p>
          <p className="mt-[5px] font-serif text-[14px] leading-none text-dim">
            {draft.live ? "Published" : "Draft"}
          </p>
        </div>
        <Switch
          on={draft.live}
          label="Toggle visibility"
          onClick={() => set({ live: !draft.live })}
        />
      </div>

      <div className="flex items-center gap-[10px]">
        <SolidButton onClick={() => dispatch({ type: "artist/save" })}>
          Save artist
        </SolidButton>
        <button
          type="button"
          onClick={close}
          className="cursor-pointer border border-ink px-[18px] py-[12px] font-sans text-[13px] leading-none font-bold tracking-[-0.4px]"
        >
          Cancel
        </button>
        {index >= 0 && (
          <span className="ml-auto">
            <UnderlineButton muted onClick={() => dispatch({ type: "artist/delete" })}>
              Delete
            </UnderlineButton>
          </span>
        )}
      </div>
    </Drawer>
  );
}
