import { templates } from "@/lib/templates";
import { formatPrice } from "@/lib/format";
import type { Wish, WishList } from "@/lib/types";

/** Leicht unterschiedliche Schräglagen, damit die Polaroids wie hingelegt wirken */
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

type BoardList =Pick<WishList, "title" | "subtitle" | "template" | "layout" | "wishes">;

interface ReserveProps {
  /** wish_id -> Name der Person, die reserviert hat */
  reserved: Record<string, string>;
  /** wish_ids, die dieser Gast selbst reserviert hat */
  mine: Set<string>;
  onReserve: (w: Wish) => void;
  onCancel: (w: Wish) => void;
}

export default function WishBoard({ list, reserve }: { list: BoardList; reserve?: ReserveProps }) {
  const t = templates[list.template] ?? templates.minimal;
  const grid = list.layout !== "liste";

  return (
    <div className={`print-sheet relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14 shadow-xl ${t.sheet}`}>
      {t.decoration.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
          {t.decoration.map((d, i) => (
            <span
              key={i}
              className={`absolute text-2xl opacity-60 ${t.accent}`}
              style={{
                top: `${[6, 12, 4, 80, 88, 70][i % 6]}%`,
                left: `${[5, 88, 45, 8, 92, 60][i % 6]}%`,
                transform: `rotate(${(i * 23) % 40 - 20}deg)`,
              }}
            >
              {d}
            </span>
          ))}
        </div>
      )}

      <header className="relative text-center mb-10">
        <h1 className={t.heading}>{list.title || t.defaultTitle}</h1>
        {list.subtitle && <p className={`mt-3 text-lg ${t.subtitle}`}>{list.subtitle}</p>}
      </header>

      {list.wishes.length === 0 ? (
        <p className={`relative text-center opacity-70 ${t.subtitle}`}>Noch keine Wünsche. Füge links deinen ersten hinzu.</p>
      ) : (
        <ul
          className={`relative ${
            grid
              ? `grid grid-cols-2 lg:grid-cols-3 ${t.polaroid ? "gap-x-5 gap-y-10 sm:gap-x-8 pt-3" : "gap-5"}`
              : `flex flex-col max-w-2xl mx-auto ${t.polaroid ? "gap-8 pt-3" : "gap-4"}`
          }`}
        >
          {list.wishes.map((w, i) => {
            const price = formatPrice(w.price, w.currency);
            const Wrapper = w.url ? "a" : "div";
            const by = reserve?.reserved[w.id];
            const tape = t.washi?.length ? t.washi[i % t.washi.length] : undefined;
            const tilt = t.polaroid ? TILTS[i % TILTS.length] : 0;
            return (
              <li
                key={w.id}
                className={`${t.polaroid ? "polaroid relative" : `${t.card} overflow-hidden`} flex flex-col ${by ? "opacity-80" : ""}`}
                style={t.polaroid ? ({ "--tilt": `${tilt}deg` } as React.CSSProperties) : undefined}
              >
                {tape && (
                  <span
                    aria-hidden
                    className="washi pointer-events-none absolute -top-3.5 left-1/2 z-10 w-24 -translate-x-1/2"
                    style={{ "--washi": `url(/deko/washi/${tape}.png)`, rotate: `${-tilt * 1.5 + (i % 2 ? 3 : -3)}deg` } as React.CSSProperties}
                  />
                )}
                <Wrapper
                  {...(w.url ? { href: w.url, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`flex flex-1 ${grid ? "flex-col" : "flex-row items-center"}`}
                >
                  {w.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`${grid ? "aspect-square w-full" : "h-24 w-24 shrink-0"} object-contain bg-white p-2 ${t.polaroid ? "ring-1 ring-black/5" : ""}`}
                    />
                  ) : (
                    <div className={`${grid ? "aspect-square w-full" : "h-24 w-24 shrink-0"} flex items-center justify-center text-4xl ${t.polaroid ? "bg-[#f3ebdf]" : "bg-black/5"}`}>
                      🎁
                    </div>
                  )}
                  <div className={`flex flex-1 flex-col gap-1 ${t.polaroid ? "px-1.5 pt-3" : "p-4"}`}>
                    <div className={`text-sm ${t.accent}`} title="Wie sehr ich es mir wünsche">
                      {"♥".repeat(w.priority)}
                      <span className="opacity-25">{"♥".repeat(3 - w.priority)}</span>
                    </div>
                    <h3 className={`${t.cardTitle} leading-snug line-clamp-3 hyphens-auto [overflow-wrap:anywhere]`}>{w.title}</h3>
                    {w.note && <p className="text-sm opacity-75">{w.note}</p>}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2 text-sm">
                      {price ? <span className={t.price}>{price}</span> : <span />}
                      {w.shop && <span className="opacity-60 truncate">{w.shop}</span>}
                    </div>
                  </div>
                </Wrapper>
                {reserve && (
                  <div className={`no-print ${t.polaroid ? "px-1.5 pt-3" : "px-4 pb-4"}`}>
                    {by ? (
                      reserve.mine.has(w.id) ? (
                        <button onClick={() => reserve.onCancel(w)}
                          className="w-full rounded-full border border-current py-1.5 text-sm opacity-80">
                          Von dir reserviert · aufheben
                        </button>
                      ) : (
                        <div className="w-full rounded-full bg-black/10 py-1.5 text-center text-sm">
                          🎁 Reserviert von {by}
                        </div>
                      )
                    ) : (
                      <button onClick={() => reserve.onReserve(w)}
                        className="w-full rounded-full bg-rose-600 py-1.5 text-sm font-semibold text-white hover:bg-rose-700">
                        Ich schenke das
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <footer className="relative mt-10 text-center text-xs opacity-50">gestaltet mit Wunschwerk</footer>
    </div>
  );
}
