"use client";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { ArtistDraft } from "@/lib/dashboard/admin-state";
import type { CategoryRow, Territory } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { Button, Chip, Segmented, buttonClass } from "./ui/controls";
import { Drawer } from "./ui/drawer";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { ImagePickButton } from "./ui/image-pick";
import { SwitchRow } from "./ui/switch-row";

const TERRITORY_OPTIONS: { value: Territory; label: string }[] = [
  { value: "US", label: "US" },
  { value: "EUROPE", label: "Europe" },
];

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
  const editing = index >= 0;

  const remove = () => {
    if (window.confirm(`Delete ${draft.name || "this artist"}? They leave the site when you publish.`)) {
      dispatch({ type: "artist/delete" });
    }
  };

  return (
    <Drawer
      title={editing ? draft.name || "Untitled artist" : "New artist"}
      description={editing ? "Saved changes go live when you publish" : "Name, disciplines and a portrait"}
      width={480}
      onClose={close}
      footer={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: "artist/save" })}>
            Save artist
          </Button>
          <Button onClick={close}>Cancel</Button>
          {editing && (
            <Button variant="danger" className="ml-auto" onClick={remove}>
              Delete
            </Button>
          )}
        </>
      }
    >
      <LabelledField label="Name">
        <NameInput
          value={draft.name}
          onChange={(name) => set({ name })}
          placeholder="e.g. Diego Nguyen"
        />
      </LabelledField>

      <LabelledField label="Categories" hint="Every discipline they work in">
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

      <LabelledField label="Territory">
        <div>
          <Segmented
            label="Territory"
            options={TERRITORY_OPTIONS}
            value={draft.territory}
            onChange={(territory) => set({ territory })}
          />
        </div>
      </LabelledField>

      <LabelledField label="Portrait" hint="A path under /assets or an https:// link">
        <div className="flex items-start gap-[14px]">
          <div className="h-[124px] w-[96px] shrink-0 overflow-hidden rounded-[2px] bg-well">
            <CoverImage src={draft.image} pos="50% 22%" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
            <ProseInput
              value={draft.image}
              onChange={(image) => set({ image })}
              placeholder="https://…"
            />
            <ImagePickButton
              onPick={(image) => set({ image })}
              className={`${buttonClass("secondary", "sm")} self-start`}
            >
              Preview a file
            </ImagePickButton>
            <p className="font-sans text-[12px] leading-[140%] text-graphite">
              A picked file only previews here. Storage isn&apos;t connected yet, so
              publish with an image address.
            </p>
          </div>
        </div>
      </LabelledField>

      <LabelledField label="Bio">
        <ProseTextarea
          rows={5}
          value={draft.bio}
          onChange={(bio) => set({ bio })}
          placeholder="A short paragraph about their work."
        />
      </LabelledField>

      <SwitchRow
        title="Show in directory"
        note={draft.live ? "Visitors can find this artist" : "Draft, hidden from visitors"}
        on={draft.live}
        onToggle={() => set({ live: !draft.live })}
      />
    </Drawer>
  );
}
