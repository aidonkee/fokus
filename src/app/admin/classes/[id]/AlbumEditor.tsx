"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Save, Move } from "lucide-react";
import type { AlbumConfig, AlbumPhoto } from "@/lib/album";
import type { LandingConfig } from "@/types/landing-config";

interface AlbumEditorProps {
  classId: string;
  photos: AlbumPhoto[];
  initialConfig: LandingConfig;
}

export function AlbumEditor({ classId, photos, initialConfig }: AlbumEditorProps) {
  const [orderIds, setOrderIds] = useState<string[]>(() => {
    const ids = new Set(photos.map((p) => p.id));
    const saved = (initialConfig.album?.photoOrder ?? []).filter((id) => ids.has(id));
    const rest = photos.map((p) => p.id).filter((id) => !saved.includes(id));
    return [...saved, ...rest];
  });

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
    return new Set(initialConfig.album?.hiddenPhotoIds ?? []);
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const photoMap = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  const orderedPhotos = useMemo(
    () => orderIds.map((id) => photoMap.get(id)).filter((p): p is AlbumPhoto => Boolean(p)),
    [orderIds, photoMap]
  );

  const album: AlbumConfig = useMemo(
    () => ({
      photoOrder: orderIds,
      hiddenPhotoIds: Array.from(hiddenIds),
    }),
    [orderIds, hiddenIds]
  );

  const markDirty = () => setSaved(false);

  const movePhoto = (from: number, to: number) => {
    if (to < 0 || to >= orderIds.length || from === to) return;
    setOrderIds((ids) => {
      const next = [...ids];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    markDirty();
  };

  const toggleVisibility = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("landing_config")
        .upsert(
          {
            class_id: classId,
            config: { ...initialConfig, album },
            updated_at: new Date().toISOString(),
          },
          { onConflict: "class_id" }
        );
      if (error) throw error;
      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error("Error saving album:", err);
      alert("Ошибка при сохранении классбука. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-10 text-center text-zinc-500">
        Сначала загрузите фотографии во вкладке «Фото» — классбук соберётся из них автоматически.
      </div>
    );
  }

  const activeCount = orderedPhotos.filter((p) => !hiddenIds.has(p.id)).length;
  const hiddenCount = orderedPhotos.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Save bar */}
      <div className="sticky top-20 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-primary">Классбук: Расположение и отображение</h2>
          {saved && <span className="text-green-400 text-sm">✓ Сохранено</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-black font-bold px-6 py-2 rounded flex items-center justify-center gap-2 hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Сохранить изменения
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
        <span>Всего разворотов: <strong className="text-white">{orderedPhotos.length}</strong></span>
        <span>•</span>
        <span>Отображаются на сайте: <strong className="text-green-400">{activeCount}</strong></span>
        {hiddenCount > 0 && (
          <>
            <span>•</span>
            <span>Скрыто: <strong className="text-zinc-500">{hiddenCount}</strong></span>
          </>
        )}
      </div>

      <p className="text-zinc-400 text-sm">
        Перетаскивайте карточки или используйте стрелки влево/вправо для изменения порядка. Нажмите на значок глаза, чтобы скрыть или показать разворот на сайте.
      </p>

      {/* Spreads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orderedPhotos.map((photo, i) => {
          const isHidden = hiddenIds.has(photo.id);
          return (
            <div
              key={photo.id}
              draggable
              onDragStart={() => {
                dragFrom.current = i;
                setDragIdx(i);
              }}
              onDragEnd={() => {
                dragFrom.current = null;
                setDragIdx(null);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom.current !== null) movePhoto(dragFrom.current, i);
                dragFrom.current = null;
                setDragIdx(null);
              }}
              className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                dragIdx === i
                  ? "opacity-30 border-primary scale-95"
                  : isHidden
                  ? "border-zinc-800 opacity-60"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/80 border-b border-zinc-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary font-bold px-2 py-0.5 rounded text-[11px]">
                    № {i + 1}
                  </span>
                  {isHidden ? (
                    <span className="text-zinc-500 font-medium">Скрыт</span>
                  ) : (
                    <span className="text-zinc-300 font-medium">Активен</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => toggleVisibility(photo.id)}
                  title={isHidden ? "Показать на сайте" : "Скрыть с сайта"}
                  className={`p-1 rounded transition ${
                    isHidden
                      ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700"
                      : "text-green-400 hover:text-green-300 hover:bg-zinc-700"
                  }`}
                >
                  {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Spread Image Preview */}
              <div className="relative aspect-[2000/1384] bg-black/40 overflow-hidden cursor-grab active:cursor-grabbing">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Разворот ${i + 1}`}
                  loading="lazy"
                  className={`w-full h-full object-cover transition duration-300 ${
                    isHidden ? "grayscale opacity-50" : ""
                  }`}
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition pointer-events-none">
                  <Move className="text-white drop-shadow" size={24} />
                </div>
              </div>

              {/* Card Footer: Reorder Controls */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => movePhoto(i, i - 1)}
                  disabled={i === 0}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-700 rounded transition"
                  title="Переместить влево"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-[11px] text-zinc-400">
                  Позиция {i + 1}
                </span>

                <button
                  type="button"
                  onClick={() => movePhoto(i, i + 1)}
                  disabled={i === orderedPhotos.length - 1}
                  className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-700 rounded transition"
                  title="Переместить вправо"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
