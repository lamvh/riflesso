"use client";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { AlbumDraft } from "@/lib/dashboard/admin-state";
import { ALBUM_KINDS } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { Button, Chip, IconButton } from "./ui/controls";
import { Drawer } from "./ui/drawer";
import { LabelledField, NameInput, ProseInput, ProseTextarea } from "./ui/fields";
import { CrossIcon, PlusIcon } from "./ui/icons";
import { ImagePickButton } from "./ui/image-pick";
import { SwitchRow } from "./ui/switch-row";

export function AlbumDrawer({
  draft,
  index,
  dispatch,
}: {
  draft: AlbumDraft;
  /** -1 when the drawer is creating rather than editing. */
  index: number;
  dispatch: (action: AdminAction) => void;
}) {
  const set = (patch: Partial<AlbumDraft>) => dispatch({ type: "draft/set", patch });
  const close = () => dispatch({ type: "drawer/close" });
  const editing = index >= 0;

  const setShot = (position: number, src: string) =>
    set({
      shots: draft.shots.map((shot, i) => (i === position ? { ...shot, src } : shot)),
    });

  const remove = () => {
    if (window.confirm(`Delete ${draft.title || "this album"}? It leaves the site when you publish.`)) {
      dispatch({ type: "album/delete" });
    }
  };

  return (
    <Drawer
      title={editing ? draft.title || "Untitled album" : "New album"}
      description={editing ? "Saved changes go live when you publish" : "A title, images and credits"}
      width={540}
      onClose={close}
      footer={
        <>
          <Button variant="primary" onClick={() => dispatch({ type: "album/save" })}>
            Save album
          </Button>
          <Button onClick={close}>Cancel</Button>
          {editing && (
            <Button variant="danger" className="ml-auto" onClick={remove}>
              Delete album
            </Button>
          )}
        </>
      }
    >
      <LabelledField label="Title">
        <NameInput
          value={draft.title}
          onChange={(title) => set({ title })}
          placeholder="e.g. Vogue UK, August"
        />
      </LabelledField>

      <LabelledField label="Type" hint="Decides which homepage row the album can appear in">
        <div className="flex flex-wrap gap-[6px]">
          {ALBUM_KINDS.map((kind) => (
            <Chip key={kind} label={kind} active={draft.kind === kind} onClick={() => set({ kind })} />
          ))}
        </div>
      </LabelledField>

      <LabelledField label="Images" hint="The first image is the cover">
        <div className="grid grid-cols-4 gap-[8px]">
          {draft.shots.map((shot, position) => (
            <div key={position} className="relative aspect-3/4 overflow-hidden rounded-[2px] bg-well">
              <CoverImage src={shot.src} pos={shot.pos} video={position === 0 && draft.video} />
              <button
                type="button"
                aria-label={`Remove image ${position + 1}`}
                onClick={() => dispatch({ type: "draft/removeShot", index: position })}
                className="absolute top-[4px] right-[4px] flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-[2px] bg-paper/90 text-ink transition-colors hover:bg-paper"
              >
                <CrossIcon size={12} />
              </button>
              {!shot.src && (
                <ImagePickButton
                  onPick={(src) => setShot(position, src)}
                  className="absolute inset-x-0 bottom-0 flex justify-center bg-paper/90 py-[6px] font-sans text-[11px] leading-none font-medium"
                >
                  Pick file
                </ImagePickButton>
              )}
              {position === 0 && shot.src && (
                <span className="absolute bottom-[4px] left-[4px] rounded-[2px] bg-ink px-[6px] py-[3px] font-sans text-[11px] leading-none font-medium text-paper">
                  Cover
                </span>
              )}
            </div>
          ))}

          <button
            type="button"
            aria-label="Add an image"
            onClick={() => dispatch({ type: "draft/addShot" })}
            className="flex aspect-3/4 cursor-pointer items-center justify-center rounded-[2px] border border-dashed border-[#b5b5b2] text-graphite transition-colors hover:border-ink hover:text-ink"
          >
            <PlusIcon size={18} />
          </button>
        </div>
      </LabelledField>

      <LabelledField
        label="Image addresses"
        hint="One per line, cover first. Picked files only preview until storage is connected."
      >
        <ProseTextarea
          rows={4}
          value={draft.shots.map((shot) => shot.src).join("\n")}
          placeholder="/assets/stories/…"
          onChange={(text) =>
            set({
              shots: text.split("\n").map((src, position) => ({
                src,
                pos: draft.shots[position]?.pos ?? "50% 18%",
              })),
            })
          }
        />
      </LabelledField>

      <LabelledField label="Credits">
        {draft.credits.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            {draft.credits.map((credit, position) => (
              <div
                key={position}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_28px] items-center gap-[8px]"
              >
                <NameInput
                  size={15}
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
                <IconButton
                  label={`Remove credit ${position + 1}`}
                  tone="danger"
                  onClick={() => dispatch({ type: "draft/removeCredit", index: position })}
                >
                  <CrossIcon />
                </IconButton>
              </div>
            ))}
          </div>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="self-start"
          onClick={() => dispatch({ type: "draft/addCredit" })}
        >
          <PlusIcon />
          Add credit
        </Button>
      </LabelledField>

      <div className="flex flex-col gap-[8px]">
        <SwitchRow
          title="Published"
          note={draft.live ? "Visible on the site" : "Draft, hidden from visitors"}
          on={draft.live}
          onToggle={() => set({ live: !draft.live })}
        />
        <SwitchRow
          title="On the homepage"
          note={draft.home ? `Can appear in the ${draft.kind} row` : "Only in the library"}
          on={draft.home}
          onToggle={() => set({ home: !draft.home })}
        />
      </div>
    </Drawer>
  );
}
