"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { AlbumPage, AlbumPhoto } from "@/lib/album";

/* ────────────────────────────────────────────────────────────
   Constants & Helpers
   ──────────────────────────────────────────────────────────── */

interface ClassBookProps {
  title: string;
  photos: AlbumPhoto[];
  pages?: AlbumPage[];
}

const DOT_ACTIVE = "#E5A91D";
const DOT_INACTIVE = "#52525B";
const SWIPE_THRESHOLD = 40;
const ROWS = 2;

function getCols(w: number): number {
  if (w < 600) return 2;
  if (w < 900) return 3;
  if (w < 1200) return 4;
  return 6;
}

/* ────────────────────────────────────────────────────────────
   ClassBook Component with Anti-Theft Protection
   ──────────────────────────────────────────────────────────── */

export default function ClassBook({ title, photos }: ClassBookProps) {
  const [cols, setCols] = useState(6);
  const [view, setView] = useState(0);
  const [lightbox, setLightbox] = useState<AlbumPhoto | null>(null);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const perView = cols * ROWS;
  const totalViews = Math.max(1, Math.ceil(photos.length / perView));
  const safeView = Math.min(view, totalViews - 1);

  useEffect(() => {
    const update = () => setCols(getCols(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ── Navigation ───────────────────────────────────────── */

  const go = useCallback(
    (dir: number) => {
      setView((cur) => {
        const next = cur + dir;
        if (next < 0 || next >= totalViews) return cur;
        return next;
      });
    },
    [totalViews]
  );

  const selectView = useCallback((v: number) => {
    setView(v);
  }, []);

  /* ── Lightbox ─────────────────────────────────────────── */

  const lbIndex = lightbox ? photos.findIndex((p) => p.id === lightbox.id) : -1;

  const goLightbox = useCallback(
    (dir: number) => {
      setLightbox((cur) => {
        if (!cur || !photos.length) return cur;
        const idx = photos.findIndex((p) => p.id === cur.id);
        if (idx === -1) return cur;
        return photos[(idx + dir + photos.length) % photos.length];
      });
    },
    [photos]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") goLightbox(1);
      if (e.key === "ArrowLeft") goLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [lightbox, goLightbox]);

  if (!photos.length) return null;

  const visiblePhotos = photos.slice(safeView * perView, (safeView + 1) * perView);

  return (
    <>
      {/* Yellow Header Banner */}
      <section className="bg-primary py-8 md:py-10 select-none">
        <div className="container mx-auto px-4 max-w-6xl flex items-center">
          <h2 className="flex-1 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] font-bold text-[#1E1E1E] leading-snug">
            {title}
          </h2>
          <div className="w-[4px] h-10 bg-[#1E1E1E] ml-6 hidden md:block shrink-0" />
        </div>
      </section>

      {/* Spreads Grid Section */}
      <section className="bg-[#1E1E1E] py-10 md:py-14 select-none no-save-photo">
        <div className="container mx-auto px-4 max-w-[1340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid gap-2.5 sm:gap-3 md:gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
              }}
            >
              {visiblePhotos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => setLightbox(photo)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="group relative aspect-[2000/1384] bg-white p-[2px] sm:p-[3px] cursor-pointer overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:z-10 select-none no-save-photo"
                >
                  <Image
                    src={photo.url}
                    alt={`Разворот ${safeView * perView + idx + 1}`}
                    fill
                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, (max-width: 1200px) 25vw, 17vw"
                    quality={45} // Slightly compressed quality for fast loading & theft prevention
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter,transform] duration-300 group-hover:scale-[1.02] pointer-events-none select-none"
                  />
                  {/* Invisible Protective Shield Overlay (blocks right click & image dragging) */}
                  <div
                    className="absolute inset-0 z-10 select-none pointer-events-auto"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          {totalViews > 1 && (
            <div className="flex justify-center items-center gap-2.5 mt-8 md:mt-10 pb-2">
              {Array.from({ length: totalViews }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectView(i)}
                  aria-label={`Слайд ${i + 1}`}
                  aria-current={i === safeView}
                  className="rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary hover:opacity-80"
                  style={
                    i === safeView
                      ? { width: 12, height: 12, backgroundColor: DOT_ACTIVE }
                      : { width: 9, height: 9, backgroundColor: DOT_INACTIVE }
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Protected Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-12 select-none no-save-photo"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр разворота"
            onClick={() => setLightbox(null)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Close button */}
            <button
              ref={closeRef}
              className="absolute top-4 right-4 text-white z-30 p-2 rounded-full hover:bg-white/10 transition"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(null);
              }}
              aria-label="Закрыть"
            >
              <X size={30} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-zinc-400 text-sm font-mono z-30 select-none">
              {lbIndex + 1} / {photos.length}
            </div>

            {/* Prev button */}
            <button
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 bg-black/60 text-white rounded-full p-2 md:p-3 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goLightbox(-1);
              }}
              aria-label="Предыдущий разворот"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Main Image with Anti-Theft Shield and Controlled Preview Quality */}
            <div
              className="relative w-full h-full max-w-5xl max-h-[82vh] flex items-center justify-center p-2 select-none"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
                <div className="relative w-full h-full max-w-full max-h-full aspect-[2000/1384] shadow-2xl bg-white p-1 select-none overflow-hidden">
                  <Image
                    key={lightbox.id}
                    src={lightbox.url}
                    alt={`Разворот ${lbIndex + 1}`}
                    fill
                    quality={50} // Reduced web preview quality (softened, unusable for print reproduction)
                    sizes="(max-width: 1024px) 100vw, 1200px"
                    className="object-contain pointer-events-none select-none"
                    draggable={false}
                    priority
                  />

                  {/* Anti-Theft Watermark Protection */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none opacity-20">
                    <span className="text-white text-base sm:text-xl md:text-2xl font-bold uppercase tracking-[0.25em] rotate-[-12deg] drop-shadow-md border border-white/40 px-6 py-2 rounded">
                      Классбук • Предпросмотр
                    </span>
                  </div>

                  {/* Protective Transparent Shield Over Image (intercepts right-click and dragging) */}
                  <div
                    className="absolute inset-0 z-20 select-none pointer-events-auto cursor-default"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              </div>
            </div>

            {/* Next button */}
            <button
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 bg-black/60 text-white rounded-full p-2 md:p-3 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goLightbox(1);
              }}
              aria-label="Следующий разворот"
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
