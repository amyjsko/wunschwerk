"use client";
import { useEffect, useRef, useState } from "react";
import { fontMap, PAGE_H, PAGE_W, paperMap } from "@/lib/design";
import { formatPrice } from "@/lib/format";
import type { Design, DesignItem, Wish } from "@/lib/types";
import { isTape, stickerMap, WashiTape } from "./stickers";
import VectorTape from "./VectorTape";

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
  /** Ausgeblendete Wünsche: im Editor blass, im Bild-Export weggelassen */
  dimmed?: Set<string>;
}

/** Bilder aus Shops laufen über unseren Server, damit sie überall laden und exportiert werden können. */
export function proxied(src?: string) {
  if (!src) return undefined;
  if (src.startsWith("data:") || src.startsWith("/")) return src;
  return `/api/bild?url=${encodeURIComponent(src)}`;
}

export function pageHeight(design: Design) {
  const bottom = Math.max(0, ...design.items.map((i) => i.y + (i.kind === "wish" ? i.w * 0.85 : i.kind === "image" ? (i.w / (i.ratio || 1)) * 0.5 : i.w * 0.5)));
  return Math.max(PAGE_H, Math.ceil((bottom + 120) / 100) * 100);
}

export default function ScrapbookBoard({ design, wishes, editable, selectedId, onSelect, onChangeItem, reserve, pageRef, dimmed }: Props) {
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
      onChangeItem?.(item.id, { rot: Math.round(rot * 10) / 10, w: Math.round(Math.min(1200, Math.max(item.kind === "sticker" && isTape(stickerMap[item.sticker ?? ""]) ? 60 : 30, (w0 * d) / d0))) });
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
          const hidden = item.kind === "wish" && !!item.wishId && !!dimmed?.has(item.wishId);
          return (
            <div
              key={item.id}
              title={hidden ? "Für Gäste ausgeblendet" : undefined}
              onPointerDown={(e) => startMove(e, item)}
              className={`absolute ${hidden ? "export-hide" : ""} ${editable ? "cursor-grab active:cursor-grabbing" : item.kind === "wish" || item.link ? "" : "pointer-events-none"}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.kind === "text" ? undefined : item.w,
                transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
                zIndex: item.z,
                userSelect: "none",
                touchAction: editable ? "none" : undefined,
              }}
            >
              {hidden ? (
                <div style={{ opacity: 0.35, filter: "grayscale(0.6)" }}>{content}</div>
              ) : (
                content
              )}
              {hidden && (
                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-800/80 px-3 py-1 text-white" style={{ fontSize: 15 }}>
                  ausgeblendet
                </div>
              )}
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
    if (def.tape) return <VectorTape name={def.tape} width={item.w} height={item.h ?? def.h ?? 42} />;
    const l = def.label;
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: String(def.ratio) }}>
        <div aria-hidden style={{ position: "absolute", inset: 0 }}>{def.draw(item.color ?? def.color)}</div>
        {l && (
          <div
            style={{
              position: "absolute", left: `${l.left ?? 0}%`, right: "4%", top: `${l.top ?? 0}%`, bottom: `${l.bottom ?? 0}%`,
              display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", whiteSpace: "pre-wrap", overflowWrap: "anywhere",
              fontFamily: (fontMap[item.font ?? "hand"] ?? fontMap.hand).family, lineHeight: 1.05, color: l.color,
              fontSize: item.w * l.size * (fontMap[item.font ?? "hand"] ?? fontMap.hand).size * Math.min(1, Math.sqrt(14 / Math.max(14, (item.text ?? l.text).length))),
            }}
          >
            {item.text ?? l.text}
          </div>
        )}
      </div>
    );
  }
  if (item.kind === "image") return <PictureItem item={item} linked={linked} />;
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

function PictureItem({ item, linked }: { item: DesignItem; linked?: boolean }) {
  const src = item.src?.startsWith("data:image/") ? item.src : item.src?.startsWith("https://i.pinimg.com/") ? proxied(item.src) : undefined;
  if (!src) return null;
  const polaroid = item.frame === "polaroid";
  const r = Math.max(2, item.w * 0.015);
  const outline = [[r, 0], [-r, 0], [0, r], [0, -r]].map(([a, b]) => `drop-shadow(${a}px ${b}px 0 #fffdf9)`).join(" ");
  const safeLink = item.link?.startsWith("https://www.pinterest.com/pin/") ? item.link : undefined;
  const picture = (
    <div style={polaroid ? { background: "#fffdf9", padding: `${item.w * 0.05}px ${item.w * 0.05}px ${item.w * (item.credit ? 0.03 : 0.16)}px`, boxShadow: "0 3px 12px rgba(60,40,20,.28)" } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} style={{ display: "block", width: "100%", aspectRatio: String(item.ratio || 1), objectFit: "contain", filter: item.frame === "sticker" ? `${outline} drop-shadow(0 3px 4px rgba(60,40,20,.3))` : undefined }} />
      {polaroid && item.credit && <div style={{ fontSize: Math.max(9, item.w * 0.05), color: "#7a6a5e", padding: "0.4em 0", textAlign: "center", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{item.credit} · Pinterest</div>}
    </div>
  );
  return linked && safeLink ? <a href={safeLink} target="_blank" rel="noopener noreferrer" className="block">{picture}</a> : picture;
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
