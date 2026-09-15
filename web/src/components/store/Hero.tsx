"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { youtubeId } from "@/lib/format";
import type { HeroSlide } from "@/lib/types";

const AUTOPLAY_MS = 7000;

function SlideMedia({ slide, active }: { slide: HeroSlide; active: boolean }) {
  if (slide.mediaType === "youtube" && slide.youtubeUrl) {
    const id = youtubeId(slide.youtubeUrl);
    if (id) {
      return (
        <div className="absolute inset-0 overflow-hidden bg-primary">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0`}
            title={slide.title}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      );
    }
  }
  if (slide.mediaType === "video" && slide.videoUrl) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={mediaUrl(slide.videoUrl)}
        poster={mediaUrl(slide.imageUrl) || undefined}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  if (!slide.imageUrl) return <div className="absolute inset-0 bg-sand" />;
  return (
    <picture>
      {slide.mobileImageUrl && <source media="(max-width: 767px)" srcSet={mediaUrl(slide.mobileImageUrl)} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl(slide.imageUrl)}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out md:object-center ${slide.mobileImageUrl ? "object-top" : "object-[70%_center]"} ${active ? "scale-100" : "scale-[1.06]"}`}
      />
    </picture>
  );
}

const alignClass = {
  left: "items-start text-left mr-auto",
  center: "items-center text-center mx-auto",
  right: "items-end text-right ml-auto",
};

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, count, paused, go]);

  return (
    <section
      className="relative isolate h-[calc(100svh-7rem)] min-h-[560px] max-h-[900px] overflow-hidden bg-sand"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => {
        const active = i === index;
        const hasOverlay = slide.overlay > 0;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
            aria-hidden={!active}
          >
            <SlideMedia slide={slide} active={active} />
            {hasOverlay && <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlay / 100 }} />}
            {/* Velo suave para legibilidad del texto en móvil */}
            {!hasOverlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-cream/85 via-cream/20 to-transparent md:bg-gradient-to-r md:from-cream/75 md:via-cream/25 xl:via-transparent xl:from-cream/40" />
            )}

            <div className="relative mx-auto flex h-full max-w-[1400px] items-end px-6 pb-24 md:items-center md:pb-0 lg:px-10">
              <div key={active ? `on-${index}` : "off"} className={`flex max-w-xl flex-col ${alignClass[slide.textAlign] ?? alignClass.left} ${hasOverlay ? "text-white" : ""}`}>
                {slide.eyebrow && (
                  <p className={`eyebrow animate-rise ${hasOverlay ? "text-white/80" : "text-accent"}`}>{slide.eyebrow}</p>
                )}
                <h1
                  className="animate-rise mt-5 whitespace-pre-line font-display text-[2.6rem] font-normal leading-[0.98] tracking-[-0.01em] sm:text-6xl lg:text-[5.4rem]"
                  style={{ animationDelay: "120ms" }}
                >
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p
                    className={`animate-rise mt-6 max-w-md text-base leading-relaxed sm:text-lg ${hasOverlay ? "text-white/85" : "text-ink/70"}`}
                    style={{ animationDelay: "240ms" }}
                  >
                    {slide.subtitle}
                  </p>
                )}
                {(slide.buttonText || slide.secondaryButtonText) && (
                  <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
                    {slide.buttonText && slide.buttonLink && (
                      <Link href={slide.buttonLink} className={`btn ${hasOverlay ? "bg-white text-ink hover:bg-accent hover:text-white" : "btn-primary"}`}>
                        {slide.buttonText}
                      </Link>
                    )}
                    {slide.secondaryButtonText && slide.secondaryButtonLink && (
                      <Link
                        href={slide.secondaryButtonLink}
                        className={`btn ${hasOverlay ? "border-white/60 text-white hover:bg-white hover:text-ink" : "btn-outline"}`}
                      >
                        {slide.secondaryButtonText}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-7 z-20">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-3">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === index}
                  className="group relative h-6 py-2.5"
                >
                  <span className={`block h-px transition-all duration-500 ${i === index ? "w-14 bg-ink" : "w-7 bg-ink/30 group-hover:bg-ink/60"}`} />
                </button>
              ))}
              <span className="ml-2 text-xs tabular-nums tracking-[0.2em] text-ink/60">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button type="button" onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 bg-cream/60 backdrop-blur transition hover:bg-cream" aria-label="Anterior">
                <ChevronLeft strokeWidth={1.3} className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 bg-cream/60 backdrop-blur transition hover:bg-cream" aria-label="Siguiente">
                <ChevronRight strokeWidth={1.3} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
