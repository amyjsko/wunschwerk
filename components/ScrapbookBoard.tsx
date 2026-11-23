"use client";
import { useEffect, useRef, useState } from "react";
import { fontMap, PAGE_H, PAGE_W, paperMap } from "@/lib/design";
import { formatPrice } from "@/lib/format";
import type { Design, DesignItem, Wish } from "@/lib/types";
import { stickerMap, WashiTape } from "./stickers";

export interface ReserveProps {
  reserved: Record<string, string>;
  mine: Set<string>;
  onReserve: (w: Wish) => void;
  onCancel: (w: Wish) => void;
}

interface Props {
  design: Design;
  wishes: Wish[];
  editable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onChangeItem?: (id: string, patch: Partial<DesignItem>) => void;
  reserve?: ReserveProps;
  pageRef?: React.RefObject<HTMLDivElement | null>;
}

/** Bilder aus Shops laufen über unseren Server, damit sie überall laden und exportiert werden können. */
export function proxied(src?: string) {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("/")) return src;
  return `/api/bild?url=${encodeURIComponent(src)}`;
}

export function pageHeight(design: Design) {
  const bottom = Math.max(0, ...design.items.map((i) => i.y + (i.kind === "wish" ? i.w * 0.85 : i.w * 0.5)));
  return Math.max(PAGE_H, Math.ceil((bottom + 120) / 100) * 100);
}

export default function ScrapbookBoard({ design, wishes, editable, selectedId, onSelect, onChangeItem, reserve, pageRef }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const localPage = useRef<HTMLDivElement>(null);
  const page = pageRef ?? localPage;
  const [scale, setScale] = useState(0.5);
  const height = pageHeight(design);
  const paper = paperMap[design.paper] ?? paperMap.creme;
  const wishById = Object.fromEntries(wishes.map((w) => [w.id, w]));

  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / PAGE_W));
    ro.observe(el);
    setScale(el.clientWidth / PAGE_W);
    return () => ro.disconnect();
  }, []);

  /** Verschieben */
  function startMove(e: React.PointerEvent, item: DesignItem) {
    if (!editable) return;
    e.stopPropagation();
    onSelect?.(item.id);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const sx = e.clientX, sy = e.clientY, ox = item.x, oy = item.y;
    let moved = false;
    const move = (ev: PointerEvent) => {
      const dx = (ev.clientX - sx) / scale, dy = (ev.clientY - sy) / scale;
      if (!moved && Math.hypot(dx, dy) < 2) return;
      moved = true;
      onChangeItem?.(item.id, {
        x: Math.round(Math.min(PAGE_W + 50, Math.max(-50, ox + dx))),
        y: Math.round(Math.max(-50, oy + dy)),
      });
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  /** Drehen und Größe ändern über den runden Griff */
  function startTransform(e: React.PointerEvent, item: DesignItem) {
    e.stopPropagation();
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const rect = page.current!.getBoundingClientRect();
    const cx = rect.left + item.x * scale, cy = rect.top + item.y * scale;
    const a0 = Math.atan2(e.clientY - cy, e.clientX - cx);
    const d0 = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
    const r0 = item.rot, w0 = item.w;
    const move = (ev: PointerEvent) => {
      const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
      const d = Math.hypot(ev.clientX - cx, ev.clientY - cy);
      let rot = r0 + ((a - a0) * 180) / Math.PI;
      rot = ((rot + 540) % 360) - 180;
      if (Math.abs(rot) < 2.5) rot = 0;
      onChangeItem?.(item.id, { rot: Math.round(rot * 10) / 10, w: Math.round(Math.min(1200, Math.max(item.kind === "sticker" && stickerMap[item.sticker ?? ""]?.washi ? 60 : 30, (w0 * d) / d0))) });
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  const items = [...design.items].sort((a, b) => a.z - b.z);

  return (
    <div ref={outer} className="relative w-full" style={{ height: height * scale }}>
      <div
        ref={page}
        onPointerDown={() => editable && onSelect?.(null)}
        className="absolute left-0 top-0 overflow-hidden rounded-[18px] shadow-xl"
        style={{
          ...paper.style,
          width: PAGE_W,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          touchAction: editable ? "none" : undefined,
        }}
      >
        {items.map((item) => {
          const selected = editable && selectedId === item.id;
          const content = renderItem(item, wishById, !editable ? reserve : undefined, paper.dark, !editable);
          if (!content) return null;
          return (
            <div
              key={item.id}
              onPointerDown={(e) => startMove(e, item)}
              className={`absolute ${editable ? "cursor-grab active:cursor-grabbing" : item.kind === "wish" ? "" : "pointer-events-none"}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.kind === "text" ? undefined : item.w,
                transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
                zIndex: item.z,
                userSelect: "none",
              }}
            >
              {content}
              {selected && (
                <>
                  <div className="pointer-events-none absolute -inset-2 rounded-md border-2 border-dashed border-rose-500" style={{ borderWidth: 2 / scale }} />
                  <div
                    onPointerDown={(e) => startTransform(e, item)}
                    title="Ziehen zum Drehen und Vergrößern"
                    className="absolute flex cursor-nwse-resize items-center justify-center rounded-full border-white bg-rose-600 text-white shadow"
                    style={{
                      width: 34 / scale, height: 34 / scale, right: -20 / scale, bottom: -20 / scale,
                      borderWidth: 3 / scale, fontSize: 18 / scale, touchAction: "none",
                    }}
                  >
                    ⟳
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderItem(item: DesignItem, wishById: Record<string, Wish>, reserve: ReserveProps | undefined, dark?: boolean, linked?: boolean) {
  if (item.kind === "sticker") {
    const def = stickerMap[item.sticker ?? ""];
    if (!def) return null;
    if (def.washi) return <WashiTape name={def.washi} height={item.h ?? def.h ?? 42} />;
    return (
      <div style={{ width: "100%", aspectRatio: String(def.ratio) }} aria-hidden>
        {def.draw(item.color ?? def.color)}
      </div>
    );
  }
  if (item.kind === "text") {
    const f = fontMap[item.font ?? "hand"] ?? fontMap.hand;
    return (
      <div
        style={{
          fontFamily: f.family,
          fontSize: item.w * 0.14 * f.size,
          color: item.color ?? (dark ? "#fbf5e9" : "#3b2f2a"),
          whiteSpace: "pre",
          lineHeight: 1.1,
          textAlign: "center",
          padding: "0.1em 0.2em",
        }}
      >
        {item.text || " "}
      </div>
    );
  }
  const w = wishById[item.wishId ?? ""];
  if (!w) return null;
  return <Polaroid wish={w} width={item.w} reserve={reserve} linked={linked} />;
}

function Polaroid({ wish, width, reserve, linked }: { wish: Wish; width: number; reserve?: ReserveProps; linked?: boolean }) {
  const price = formatPrice(wish.price, wish.currency);
  const by = reserve?.reserved[wish.id];
  const Img = wish.url && linked ? "a" : "div";
  return (
    <div
      className="bg-white text-[#3b2f2a]"
      style={{
        fontSize: (width / 250) * 16,
        padding: "0.7em 0.7em 0.8em",
        boxShadow: "0 0.15em 0.6em rgba(60,40,20,.25), 0 0.05em 0.1em rgba(60,40,20,.2)",
      }}
    >
      <Img
        {...(Img === "a" ? { href: wish.url, target: "_blank", rel: "noopener noreferrer" } : {})}
        className="relative block"
        style={{ aspectRatio: "1", background: "#f4efe8" }}
      >
        {wish.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proxied(wish.image)}
            alt=""
            draggable={false}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.dataset.fallback !== "1" && wish.image) {
                el.dataset.fallback = "1";
                el.src = wish.image;
              }
            }}
            className="h-full w-full object-contain"
            style={{ padding: "0.4em" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center" style={{ fontSize: "3.5em" }}>🎁</div>
        )}
        {by && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,.55)" }}
          >
            <span
              className="border-[0.12em] border-[#c8102e] px-[0.4em] text-[#c8102e]"
              style={{ fontFamily: "var(--font-marker), cursive", fontSize: "1.4em", transform: "rotate(-12deg)", borderRadius: "0.2em" }}
            >
              reserviert
            </span>
          </div>
        )}
      </Img>
      <div style={{ fontFamily: "var(--font-hand), cursive", fontSize: "1.35em", lineHeight: 1.1, marginTop: "0.35em" }} className="line-clamp-3">
        {wish.title}
      </div>
      <div className="flex items-center justify-between" style={{ fontSize: "0.85em", marginTop: "0.25em" }}>
        <span style={{ color: "#e8577a", letterSpacing: "0.05em" }}>
          {"♥".repeat(wish.priority)}
          <span style={{ opacity: 0.25 }}>{"♥".repeat(3 - wish.priority)}</span>
        </span>
        <span className="font-semibold">{price}</span>
      </div>
      {wish.note && (
        <div style={{ fontFamily: "var(--font-hand), cursive", fontSize: "1.05em", opacity: 0.75, marginTop: "0.15em" }}>{wish.note}</div>
      )}
      {reserve && (
        <div className="no-print" style={{ marginTop: "0.5em", fontSize: "0.85em" }}>
          {by ? (
            reserve.mine.has(wish.id) ? (
              <button onClick={() => reserve.onCancel(wish)} className="w-full rounded-full border border-current" style={{ padding: "0.35em" }}>
                Von dir reserviert · aufheben
              </button>
            ) : (
              <div className="w-full rounded-full bg-black/10 text-center" style={{ padding: "0.35em" }}>
                🎁 Reserviert von {by}
              </div>
            )
          ) : (
            <button
              onClick={() => reserve.onReserve(wish)}
              className="w-full rounded-full bg-rose-600 font-semibold text-white hover:bg-rose-700"
              style={{ padding: "0.35em" }}
            >
              Ich schenke das
            </button>
          )}
        </div>
      )}
    </div>
  );
}
