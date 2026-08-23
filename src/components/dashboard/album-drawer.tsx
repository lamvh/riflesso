"use client";

import { ALBUM_KINDS, type AlbumKind } from "@/lib/dashboard/admin-types";
import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { AlbumDraft } from "@/lib/dashboard/admin-state";

import { CoverImage } from "./cover-image";
import { Chip, SolidButton, UnderlineButton } from "./ui/controls";
import { Drawer } from "./ui/drawer";
import { LabelledField, NameInput, ProseInput } from "./ui/fields";
import { ImagePickButton } from "./ui/image-pick";
import { SwitchRow } from "./ui/switch-row";

export function AlbumDrawer({
  draft,
  index,
  dispatch,
}: {
  draft: AlbumDraft;
  index: number;
  dispatch: (action: AdminAction) => void;
}) {
  const set = (patch: Partial<AlbumDraft>) => dispatch({ type: "draft/set", patch });
  const close = () => dispatch({ type: "drawer/close" });

  const setShot = (position: number, src: string) =>
    set({
      shots: draft.shots.map((shot, i) => (i === position ? { ...shot, src } : shot)),
    });

  return (
    <Drawer
      title={index >= 0 ? "Edit details" : "New album"}
      width={520}
      onClose={close}
    >
      <LabelledField label="Album title">
        <NameInput
          value={draft.title}
          onChange={(title) => set({ title })}
          placeholder="e.g. Vogue UK — August"
        />
      </LabelledField>

      <LabelledField label="Album type" gap={9}>
        <div className="flex flex-wrap gap-[6px]">
          {ALBUM_KINDS.map((kind) => (
            <Chip
              key={kind}
              label={kind}
              active={draft.kind === kind}
              onClick={() => set({ kind: kind as AlbumKind })}
            />
          ))}
        </div>
      </LabelledField>

      <LabelledField label="Images" gap={9}>
        <div className="grid grid-cols-4 gap-[8px]">
          {draft.shots.map((shot, position) => (
            <div key={position} className="relative aspect-3/4 overflow-hidden bg-well">
              <CoverImage src={shot.src} pos={shot.pos} video={position === 0 && draft.video} />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => dispatch({ type: "draft/removeShot", index: position })}
                className="absolute top-[4px] right-[4px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center border border-ink bg-paper font-sans text-[10px] leading-none font-bold"
              >
                ✕
              </button>
              {!shot.src && (
                <ImagePickButton
                  onPick={(src) => setShot(position, src)}
                  className="absolute inset-x-0 bottom-0 flex justify-center bg-paper/90 py-[3px] font-sans text-[9px] leading-none font-bold tracking-[0.04em] uppercase"
                >
                  Add file
                </ImagePickButton>
              )}
              {position === 0 && shot.src && (
                <span className="absolute inset-x-0 bottom-0 bg-ink py-[3px] text-center font-sans text-[9px] leading-none font-bold tracking-[0.04em] text-paper uppercase">
                  Cover
                </span>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => dispatch({ type: "draft/addShot" })}
            className="flex aspect-3/4 cursor-pointer items-center justify-center border border-dashed border-ink bg-shell font-sans text-[24px] leading-none font-bold"
          >
            +
          </button>
        </div>
      </LabelledField>

      <LabelledField label="Artist credits" gap={9}>
        {draft.credits.map((credit, position) => (
          <div
            key={position}
            className="grid grid-cols-[1.2fr_1fr_32px] items-center gap-[8px]"
          >
            <NameInput
              size={14}
              value={credit.name}
              placeholder="Artist name"
              onChange={(name) =>
                dispatch({ type: "draft/setCredit", index: position, patch: { name } })
              }
            />
            <ProseInput
              value={credit.role}
              placeholder="Role"
              onChange={(role) =>
                dispatch({ type: "draft/setCredit", index: position, patch: { role } })
              }
            />
            <button
              type="button"
              aria-label="Remove credit"
              onClick={() => dispatch({ type: "draft/removeCredit", index: position })}
              className="flex h-[34px] cursor-pointer items-center justify-center border border-ink font-sans text-[11px] leading-none font-bold"
            >
              ✕
            </button>
          </div>
        ))}
        <span className="self-start">
          <UnderlineButton onClick={() => dispatch({ type: "draft/addCredit" })}>
            + Add credit
          </UnderlineButton>
        </span>
      </LabelledField>

      <SwitchRow
        bordered="top"
        title="Feature on homepage"
        note={draft.home ? "Appears in a homepage row" : "Library only"}
        on={draft.home}
        onToggle={() => set({ home: !draft.home })}
      />

      <SwitchRow
        bordered="bottom"
        title="Status"
        note={draft.live ? "Published" : "Draft"}
        on={draft.live}
        onToggle={() => set({ live: !draft.live })}
      />

      <div className="flex items-center gap-[10px]">
        <SolidButton onClick={() => dispatch({ type: "album/save" })}>
          Save album
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
            <UnderlineButton muted onClick={() => dispatch({ type: "album/delete" })}>
              Delete album
            </UnderlineButton>
          </span>
        )}
      </div>
    </Drawer>
  );
}
