"use client";

import { layoutForKey, type AlbumPhoto } from "@/lib/album";

interface BookPageProps {
  layout: string
  photos: AlbumPhoto[]
  onPhotoClick?: (photo: AlbumPhoto) => void
  className?: string
}

export default function BookPage({ layout, photos, onPhotoClick, className = "" }: BookPageProps) {
  const l = layoutForKey(layout)

  return (
    <div className={`h-full w-full bg-white p-1 sm:p-1.5 ${className}`}>
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 sm:gap-1.5">
        {l.slots.map((slot, i) => {
          const photo = photos[i]
          return (
            <div key={i} className={`relative min-h-0 min-w-0 overflow-hidden bg-zinc-200 ${slot}`}>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.url}
                  alt={`Фото ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onClick={
                    onPhotoClick
                      ? () => onPhotoClick(photo)
                      : undefined
                  }
                  className={`h-full w-full object-cover ${
                    onPhotoClick
                      ? "cursor-pointer transition-transform duration-300 hover:scale-105"
                      : ""
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LayoutIcon({ layout, active = false }: { layout: string; active?: boolean }) {
  const l = layoutForKey(layout)
  return (
    <div
      className={`grid h-7 w-9 grid-cols-2 grid-rows-2 gap-0.5 rounded-sm border p-0.5 transition ${
        active ? "border-primary bg-primary/20" : "border-zinc-600 bg-zinc-800 hover:border-zinc-400"
      }`}
      title={l.label}
    >
      {l.slots.map((slot, i) => (
        <div key={i} className={`rounded-[1px] ${active ? "bg-primary" : "bg-zinc-500"} ${slot}`} />
      ))}
    </div>
  )
}
