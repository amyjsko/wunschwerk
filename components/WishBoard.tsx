import { templates } from "@/lib/templates";
import { formatPrice } from "@/lib/format";
import type { WishList } from "@/lib/types";

type BoardList = Pick<WishList, "title" | "subtitle" | "template" | "layout" | "wishes">;

export default function WishBoard({ list }: { list: BoardList }) {
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
        <ul className={`relative ${grid ? "grid gap-5 grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4 max-w-2xl mx-auto"}`}>
          {list.wishes.map((w) => {
            const price = formatPrice(w.price, w.currency);
            const Wrapper = w.url ? "a" : "div";
            return (
              <li key={w.id} className={`${t.card} overflow-hidden`}>
                <Wrapper
                  {...(w.url ? { href: w.url, target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`flex h-full ${grid ? "flex-col" : "flex-row items-center"}`}
                >
                  {w.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.image}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`${grid ? "aspect-square w-full" : "h-24 w-24 shrink-0"} object-contain bg-white p-2`}
                    />
                  ) : (
                    <div className={`${grid ? "aspect-square w-full" : "h-24 w-24 shrink-0"} flex items-center justify-center text-4xl bg-black/5`}>
                      🎁
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className={`text-sm ${t.accent}`} title="Wie sehr ich es mir wünsche">
                      {"♥".repeat(w.priority)}
                      <span className="opacity-25">{"♥".repeat(3 - w.priority)}</span>
                    </div>
                    <h3 className={`${t.cardTitle} leading-snug line-clamp-3`}>{w.title}</h3>
                    {w.note && <p className="text-sm opacity-75">{w.note}</p>}
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2 text-sm">
                      {price ? <span className={t.price}>{price}</span> : <span />}
                      {w.shop && <span className="opacity-60 truncate">{w.shop}</span>}
                    </div>
                  </div>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      )}
      <footer className="relative mt-10 text-center text-xs opacity-50">gestaltet mit Wunschwerk</footer>
    </div>
  );
}
