"use client";

import Image from "next/image";

type ArtistPreviewImageProps = {
  src: string | null;
  alt: string;
};

/** Aspect ratio taken from the source design (portrait, ~3:4). */
const ASPECT_RATIO_PADDING = "133.0134357006%";

export function ArtistPreviewImage({ src, alt }: ArtistPreviewImageProps) {
  return (
    <div className="hidden max-w-[521px] shrink-0 grow-0 basis-[30%] self-start overflow-hidden pt-[240px] lg:sticky lg:top-0 lg:block">
      <div
        className="relative w-full"
        style={{ paddingBottom: ASPECT_RATIO_PADDING }}
      >
        {src && (
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            sizes="min(30vw, 521px)"
            className="object-cover object-center"
          />
        )}
      </div>
    </div>
  );
}
