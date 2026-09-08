"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
   ClassBook Component
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
      <section className="bg-primary py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-6xl flex items-center">
          <h2 className="flex-1 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] font-bold text-[#1E1E1E] leading-snug">
            {title}
          </h2>
          <div className="w-[4px] h-10 bg-[#1E1E1E] ml-6 hidden md:block shrink-0" />
        </div>
      </section>

      {/* Spreads Grid Section */}
      <section className="bg-[#1E1E1E] py-10 md:py-14">
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
                  className="group relative aspect-[2000/1384] bg-white p-[2px] sm:p-[3px] cursor-pointer overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:z-10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Разворот ${safeView * perView + idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-[filter,transform] duration-300 group-hover:scale-[1.02]"
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-12"
            role="dialog"
            aria-modal="true"
            aria-label="Просмотр разворота"
            onClick={() => setLightbox(null)}
          >
            {/* Close button */}
            <button
              ref={closeRef}
              className="absolute top-4 right-4 text-white z-10 p-2 rounded-full hover:bg-white/10 transition"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(null);
              }}
              aria-label="Закрыть"
            >
              <X size={30} />
            </button>

            {/* Counter */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 text-zinc-400 text-sm font-mono z-10 select-none">
              {lbIndex + 1} / {photos.length}
            </div>

            {/* Prev button */}
            <button
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-2 md:p-3 transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                goLightbox(-1);
              }}
              aria-label="Предыдущий разворот"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={lightbox.id}
                  src={lightbox.url}
                  alt={`Разворот ${lbIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-full max-h-full object-contain shadow-2xl bg-white p-1"
                />
              </AnimatePresence>
            </div>

            {/* Next button */}
            <button
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white rounded-full p-2 md:p-3 transition hover:bg-white/20"
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
