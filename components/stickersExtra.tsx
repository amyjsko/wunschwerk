import VectorTape from "./VectorTape";
import type { Occasion, StickerDef } from "./stickers";

const ink = "#3b2f2a";
const green = "#48694f";
const red = "#a3343c";
const gold = "#c79a3f";

const S = (w: number, h: number, children: React.ReactNode) => (
  <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

type Draw = (c: string) => React.ReactNode;
const make = (group: StickerDef["group"], occasions: Occasion[]) =>
  (id: string, name: string, ratio: number, w: number, color: string, draw: Draw, rest: Partial<StickerDef> = {}): StickerDef =>
    ({ id, name, ratio, w, color, group, occasions, draw, ...rest });

const tape = (id: string, name: string, occasion: Occasion): StickerDef => ({
  id: `tape-v-${id}`, name: `Washi-Tape ${name}`, ratio: 4, w: 220, h: 42, color: "", group: "tape", occasions: [occasion], tape: id,
  draw: () => <VectorTape name={id} width={220} height={42} fit />,
});

/** Eigene, gemalte Bilder aus public/sticker */
const bild = (id: string, name: string, ratio: number, w: number, occasions: Occasion[]): StickerDef => ({
  id: `bild-${id}`, name, ratio, w, color: "", group: "deko", occasions, fixedColor: true,
  // eslint-disable-next-line @next/next/no-img-element
  draw: () => <img src={`/sticker/${id}.png`} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain" }} />,
});

const x = make("deko", ["weihnachten"]);
const xd = make("doodle", ["weihnachten"]);
const tag = make("zettel", ["weihnachten"]);
const a = make("deko", ["alltag"]);
const d = make("doodle", ["alltag"]);
const z = make("zettel", ["alltag"]);

const leaf = "M0 0 C-12 -10 -14 -26 0 -42 C14 -26 12 -10 0 0 Z";
const hollyLeaf = "M0 0 C-4 -8 -14 -6 -16 -12 C-8 -14 -14 -24 -18 -30 C-8 -28 -6 -38 0 -48 C6 -38 8 -28 18 -30 C14 -24 8 -14 16 -12 C14 -6 4 -8 0 0 Z";
const heart = "M0 16 C-16 4 -20 -4 -16 -11 C-12 -18 -3 -17 0 -8 C3 -17 12 -18 16 -11 C20 -4 16 4 0 16 Z";
const starPath = "M0 -20 L5.5 -6.5 L20 -6 L8.5 3 L12.5 17 L0 9 L-12.5 17 L-8.5 3 L-20 -6 L-5.5 -6.5 Z";

const branch = (len: number, c: string) => (
  <g stroke={c} strokeWidth="3.5" fill="none">
    {Array.from({ length: Math.floor(len / 7) }, (_, i) => {
      const y = -6 - i * 7, l = 24 - (i * 7 * 16) / len;
      return <path key={i} d={`M0 ${y} L${-l} ${y - 12} M0 ${y} L${l} ${y - 12}`} />;
    })}
    <path d={`M0 0 V${-len}`} stroke="#7a5b3e" />
  </g>
);

export const extraStickers: StickerDef[] = [
  tape("tartan", "Tartan", "weihnachten"),
  tape("tannenzweig", "Tannenzweig", "weihnachten"),
  tape("schnee", "Schneeflocken", "weihnachten"),
  tape("zuckerstange", "Zuckerstange", "weihnachten"),
  tape("goldsterne", "Goldsterne", "weihnachten"),
  tape("stechpalme", "Stechpalme", "weihnachten"),
  tape("gruen", "Tannengrün", "weihnachten"),
  tape("bordeauxpunkte", "Bordeaux-Punkte", "weihnachten"),
  tape("noten", "Weihnachtslied", "weihnachten"),
  tape("kraft", "Kraftpapier", "alltag"),
  tape("salbei", "Salbei", "alltag"),
  tape("herzen", "Herzen", "alltag"),
  tape("ginghamsalbei", "Salbei-Karo", "alltag"),

  bild("schleife-samt", "Samtschleife", 302 / 271, 130, ["weihnachten", "alltag"]),
  bild("schleife-salbei", "Salbeischleife", 275 / 224, 130, ["alltag", "weihnachten"]),
  bild("schleife-rose", "Roséschleife", 268 / 247, 130, ["alltag"]),
  bild("stern-gold", "Goldener Stern", 475 / 480, 120, ["weihnachten", "alltag"]),
  bild("herz-bordeaux", "Bordeaux-Herz", 190 / 218, 90, ["alltag"]),
  bild("blatt-salbei", "Salbeiblatt", 263 / 237, 120, ["alltag"]),
  bild("rahmen-polaroid", "Polaroid-Rahmen", 256 / 281, 200, ["alltag"]),

  // Weihnachts-Sticker
  x("tannenzweig", "Tannenzweig", 0.8, 110, green, (c) => S(80, 100, <><g transform="translate(40 98) scale(1 1)">{branch(88, c)}</g><circle cx="33" cy="72" r="6" fill={red} /><circle cx="46" cy="78" r="6" fill={red} /></>)),
  x("stechpalme", "Stechpalme", 1.2, 110, green, (c) => S(120, 100, <>
    {[-62, 62].map((r) => <g key={r} transform={`translate(60 62) rotate(${r})`}><path d={hollyLeaf} fill={c} stroke={ink} strokeWidth="1.5" /><path d="M0 -4 V-42" stroke="#fff" opacity=".35" strokeWidth="2" /></g>)}
    {[[52, 64], [68, 64], [60, 52]].map(([cx, cy]) => <g key={`${cx}${cy}`}><circle cx={cx} cy={cy} r="10" fill={red} stroke={ink} strokeWidth="1.5" /><circle cx={cx - 3} cy={cy - 3} r="2.5" fill="#fff" opacity=".6" /></g>)}
  </>)),
  x("kranz", "Kranz", 1, 170, green, (c) => S(120, 120, <>
    {Array.from({ length: 22 }, (_, i) => <g key={i} transform={`rotate(${(i * 360) / 22} 60 60) translate(60 18) rotate(${i % 2 ? 62 : 108})`}><path d={leaf} transform="scale(.72)" fill={c} opacity={i % 2 ? 1 : 0.78} /></g>)}
    {[20, 95, 150, 215, 265, 330].map((r) => <circle key={r} cx="60" cy="19" r="5" fill={red} transform={`rotate(${r} 60 60)`} />)}
    <g transform="translate(60 102)"><path d="M0 0 C-12 -14 -30 -14 -28 0 C-26 12 -10 8 0 0 C12 -14 30 -14 28 0 C26 12 10 8 0 0 Z M-3 2 L-14 18 M3 2 L14 18" fill={red} stroke={red} strokeWidth="4" /><circle r="5" fill="#8a2932" /></g>
  </>)),
  x("kerze", "Kerze", 0.5, 70, "#f3e4c8", (c) => S(50, 100, <>
    <circle cx="25" cy="18" r="17" fill="#f6d38b" opacity=".4" /><path d="M25 4 C34 15 32 26 25 27 C18 26 16 15 25 4 Z" fill="#eaa63c" /><path d="M25 14 C29 20 28 25 25 26 C22 25 21 20 25 14 Z" fill="#fff0c0" />
    <path d="M25 27 V34" stroke={ink} strokeWidth="2" /><path d="M13 36 C18 32 32 32 37 36 V88 H13 Z" fill={c} stroke={ink} strokeWidth="1.5" /><path d="M13 40 C15 52 18 52 19 42 C22 40 24 62 27 42" stroke="#fff" strokeWidth="3" fill="none" />
    <path d="M6 88 H44 L40 97 H10 Z" fill={gold} stroke={ink} strokeWidth="1.5" /><path d="M8 88 C14 78 22 82 25 88 C28 82 36 78 42 88" fill={green} /><circle cx="25" cy="85" r="4" fill={red} />
  </>)),
  x("kugel", "Christbaumkugel", 0.82, 90, red, (c) => S(82, 100, <>
    <path d="M41 12 C34 2 48 2 41 12" stroke={gold} strokeWidth="2.5" fill="none" /><rect x="33" y="12" width="16" height="11" rx="2" fill={gold} stroke={ink} strokeWidth="1.5" /><circle cx="41" cy="60" r="37" fill={c} stroke={ink} strokeWidth="1.5" />
    <path d="M5 54 C28 68 54 68 77 54 L78 66 C54 80 28 80 4 66 Z" fill="#f3e4c8" opacity=".9" />{[18, 33, 49, 64].map((px) => <path key={px} transform={`translate(${px} ${px === 18 || px === 64 ? 66 : 71}) scale(.25)`} d={starPath} fill={gold} />)}<path d="M18 42 C22 34 28 30 35 28" stroke="#fff" strokeWidth="5" opacity=".5" fill="none" />
  </>)),
  x("glocke", "Glocke", 0.95, 90, gold, (c) => S(95, 100, <>
    <path d="M47 18 C26 20 24 44 22 60 C21 70 14 74 12 80 H83 C81 74 74 70 73 60 C71 44 69 20 47 18 Z" fill={c} stroke={ink} strokeWidth="1.8" /><circle cx="47" cy="86" r="9" fill={c} stroke={ink} strokeWidth="1.8" /><path d="M32 34 C28 44 28 54 27 64" stroke="#fff" opacity=".55" strokeWidth="5" fill="none" />
    <path d="M47 16 C34 -2 14 4 20 16 C24 24 38 20 47 16 C60 -2 80 4 74 16 C70 24 56 20 47 16 Z" fill={red} stroke={ink} strokeWidth="1.5" /><circle cx="47" cy="16" r="5" fill="#8a2932" />
  </>)),
  x("zuckerstange", "Zuckerstange", 0.6, 75, red, (c) => S(60, 100, <>
    <path d="M20 92 V32 C20 8 50 8 50 32 V38" stroke={ink} strokeWidth="17" fill="none" /><path d="M20 92 V32 C20 8 50 8 50 32 V38" stroke="#fdf6ea" strokeWidth="14" fill="none" /><path d="M20 92 V32 C20 8 50 8 50 32 V38" stroke={c} strokeWidth="14" fill="none" strokeDasharray="9 11" strokeLinecap="butt" />
    <path d="M20 66 C8 54 0 60 4 68 C8 74 14 70 20 66 C32 54 40 60 36 68 C32 74 26 70 20 66 M18 68 L10 82 M22 68 L30 82" fill={green} stroke={green} strokeWidth="3" />
  </>)),
  x("lebkuchen", "Lebkuchenmann", 0.85, 100, "#a8693c", (c) => S(85, 100, <>
    <path d="M42 6 C58 6 62 24 54 34 C66 34 80 30 81 40 C82 50 68 50 58 50 C58 62 72 78 68 88 C64 98 52 92 42 74 C32 92 20 98 16 88 C12 78 26 62 26 50 C16 50 2 50 3 40 C4 30 18 34 30 34 C22 24 26 6 42 6 Z" fill={c} stroke="#7a4726" strokeWidth="2.5" />
    <circle cx="36" cy="20" r="2.5" fill={ink} /><circle cx="48" cy="20" r="2.5" fill={ink} /><path d="M35 27 C39 31 45 31 49 27" stroke="#fff6e4" strokeWidth="2.5" fill="none" /><circle cx="42" cy="46" r="3" fill={red} /><circle cx="42" cy="57" r="3" fill={green} />
    <path d="M10 36 C8 40 10 43 9 47 M75 36 C77 40 75 43 76 47 M18 80 C22 80 24 85 28 85 M66 80 C62 80 60 85 56 85" stroke="#fff6e4" strokeWidth="3" fill="none" />
  </>), { fixedColor: true }),
  x("zimt", "Zimtstangen", 1.3, 110, "#9a6237", (c) => S(130, 100, <>
    {[[-18, 0], [12, 0], [-3, -8]].map(([r, dy], i) => <g key={i} transform={`rotate(${r} 65 50) translate(0 ${dy})`}><rect x="12" y={42} width="106" height="18" rx="7" fill={c} stroke="#6d4020" strokeWidth="2" /><path d="M22 48 H108 M26 54 H100" stroke="#6d4020" opacity=".45" strokeWidth="1.5" /><circle cx="114" cy="51" r="5" fill="#7a4a27" /></g>)}
    <path d="M58 22 C52 40 52 62 58 80 M66 22 C72 40 72 62 66 80" stroke={red} strokeWidth="4" fill="none" /><path d="M62 48 C48 28 32 36 40 46 C46 52 56 50 62 48 C76 28 92 36 84 46 C78 52 68 50 62 48 Z" fill={red} stroke="#7d2a33" strokeWidth="1.5" />
  </>), { fixedColor: true }),
  x("orange", "Orangenscheibe", 1, 95, "#dc8d3a", (c) => S(100, 100, <>
    <circle cx="50" cy="50" r="45" fill="#b7662a" /><circle cx="50" cy="50" r="40" fill="#f6dfb5" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} transform={`rotate(${i * 40} 50 50)`} d="M50 46 C43 34 40 24 43 15 C47 12 53 12 57 15 C60 24 57 34 50 46 Z" fill={c} opacity={i % 2 ? 0.95 : 0.8} />)}<circle cx="50" cy="50" r="4" fill="#f6dfb5" />
  </>)),
  x("weihnachtsstern", "Weihnachtsstern-Blüte", 1, 120, red, (c) => S(120, 120, <>
    {[0, 72, 144, 216, 288].map((r) => <g key={r} transform={`rotate(${r + 36} 60 60) translate(60 60)`}><path d={leaf} transform="scale(1.1 1.35)" fill={green} /></g>)}
    {[0, 60, 120, 180, 240, 300].map((r) => <g key={r} transform={`rotate(${r} 60 60) translate(60 60)`}><path d={leaf} transform="scale(1.1 1.2)" fill={c} stroke="#7d2a33" strokeWidth="1.2" /><path d="M0 -6 V-40" stroke="#7d2a33" opacity=".5" strokeWidth="1.5" /></g>)}
    {[[56, 58], [64, 58], [60, 65], [60, 53]].map(([cx, cy]) => <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="4" fill="#e2b84d" />)}
  </>)),
  x("schneemann", "Schneemann", 0.7, 100, red, (c) => S(70, 100, <>
    <circle cx="35" cy="74" r="23" fill="#fffdf8" stroke={ink} strokeWidth="1.8" /><circle cx="35" cy="40" r="17" fill="#fffdf8" stroke={ink} strokeWidth="1.8" /><rect x="22" y="6" width="26" height="18" fill={ink} /><path d="M14 25 H56" stroke={ink} strokeWidth="5" /><rect x="22" y="17" width="26" height="5" fill={c} />
    <circle cx="29" cy="38" r="2" fill={ink} /><circle cx="41" cy="38" r="2" fill={ink} /><path d="M35 42 L48 46 L35 47 Z" fill="#dc8d3a" /><path d="M20 52 C30 60 40 60 50 52 L51 58 C40 66 30 66 19 58 Z M46 58 L54 76 L46 78 L41 61 Z" fill={c} stroke={ink} strokeWidth="1.2" /><circle cx="33" cy="74" r="2.5" fill={ink} /><circle cx="33" cy="84" r="2.5" fill={ink} /><path d="M12 66 L2 54 M58 66 L68 54" stroke="#7a5b3e" strokeWidth="3" />
  </>)),
  x("strumpf", "Weihnachtsstrumpf", 0.8, 100, red, (c) => S(80, 100, <><path d="M22 26 H60 V58 C64 70 76 74 72 86 C68 98 44 98 34 88 C26 80 24 64 22 26 Z" fill={c} stroke={ink} strokeWidth="2" /><path d="M48 92 C46 82 56 74 66 74 C76 78 74 92 60 93 Z" fill="#f3e4c8" opacity=".9" /><rect x="16" y="10" width="50" height="20" rx="8" fill="#fffaf0" stroke={ink} strokeWidth="2" /><path d="M41 46 l3 8 l8 0 l-6 5 l2 8 l-7 -5 l-7 5 l2 -8 l-6 -5 l8 0 Z" fill="#f3e4c8" /></>)),
  x("handschuh", "Fäustling", 0.8, 85, green, (c) => S(80, 100, <><path d="M18 68 V36 C18 8 58 8 58 36 V44 C66 36 78 42 72 54 L58 72 Z" fill={c} stroke={ink} strokeWidth="2" /><rect x="13" y="68" width="50" height="22" rx="8" fill="#fffaf0" stroke={ink} strokeWidth="2" /><g transform="translate(38 44)" stroke="#fffaf0" strokeWidth="3">{[0, 60, 120].map((r) => <path key={r} transform={`rotate(${r})`} d="M0 -12 V12" />)}</g></>)),
  x("haus", "Winterhaus", 1, 120, "#a8563f", (c) => S(100, 100, <><rect x="20" y="46" width="60" height="46" fill={c} stroke={ink} strokeWidth="2" /><path d="M10 50 L50 14 L90 50 Z" fill="#6f4b3a" stroke={ink} strokeWidth="2" /><path d="M8 50 L50 12 L92 50 C84 56 80 46 73 50 C66 54 62 38 50 26 C38 38 34 54 27 50 C20 46 16 56 8 50 Z" fill="#fffdf8" stroke={ink} strokeWidth="1.5" /><rect x="43" y="66" width="15" height="26" fill="#4a3329" /><rect x="26" y="58" width="12" height="14" fill="#f6d38b" stroke={ink} /><rect x="63" y="58" width="12" height="14" fill="#f6d38b" stroke={ink} /><path d="M4 93 C30 86 70 98 96 92" stroke="#fffdf8" strokeWidth="7" fill="none" /></>)),
  x("rotkehlchen", "Rotkehlchen", 1.1, 100, "#8a6a50", (c) => S(110, 100, <><path d="M20 46 C24 18 62 12 76 34 C92 44 100 60 106 78 L82 72 C70 90 34 90 22 66 Z" fill={c} stroke={ink} strokeWidth="1.8" /><path d="M21 42 C24 28 40 30 46 44 C56 62 48 82 34 78 C20 70 18 54 21 42 Z" fill="#c8553a" /><path d="M20 44 L6 48 L21 53 Z" fill="#dc9a3a" /><circle cx="36" cy="35" r="4" fill={ink} /><circle cx="35" cy="34" r="1.3" fill="#fff" /><path d="M58 46 C74 46 84 58 88 68 C72 72 60 64 58 46 Z" fill="#6b4f3a" /><path d="M46 84 V96 M58 83 V96 M41 97 H51 M53 97 H63" stroke={ink} strokeWidth="2.5" /></>)),

  // Weihnachts-Doodles
  xd("lichterkette", "Lichterkette", 4, 360, green, (c) => S(400, 100, <><path d="M4 18 C60 70 110 70 140 34 C180 74 230 74 264 34 C300 72 350 66 396 18" stroke={c} strokeWidth="4" fill="none" />{[[30, 40], [66, 58], [104, 58], [140, 36], [178, 60], [216, 62], [264, 36], [302, 58], [342, 56], [374, 38]].map(([px, py], i) => <g key={px} transform={`translate(${px} ${py})`}><rect x="-5" y="0" width="10" height="7" fill={c} /><path d="M0 6 C13 14 8 30 0 33 C-8 30 -13 14 0 6 Z" fill={["#b23a42", "#d8a53f", "#5d8a69", "#e3a993"][i % 4]} stroke={ink} strokeWidth="1.5" /></g>)}</>)),
  xd("schneefall", "Schneegestöber", 1.6, 180, "#9db6c4", (c) => S(160, 100, <>{[[26, 30, 1], [78, 62, 1.3], [128, 28, 0.9], [134, 80, 0.6]].map(([px, py, s]) => <g key={px} transform={`translate(${px} ${py}) scale(${s})`} stroke={c} strokeWidth="3.5">{[0, 60, 120].map((r) => <path key={r} transform={`rotate(${r})`} d="M0 -18 V18 M0 -11 L-5 -16 M0 -11 L5 -16 M0 11 L-5 16 M0 11 L5 16" />)}</g>)}{[[50, 14], [20, 76], [104, 12], [108, 60], [46, 88]].map(([px, py]) => <circle key={px} cx={px} cy={py} r="3.5" fill={c} />)}</>)),
  xd("sternenreihe", "Sternenreihe", 4, 260, gold, (c) => S(320, 80, <>{[28, 92, 160, 226, 290].map((px, i) => <path key={px} transform={`translate(${px} ${40 + (i % 2) * 14 - 7}) rotate(${i * 17}) scale(${i % 2 ? 0.8 : 1.25})`} d={starPath} fill={i % 2 ? c : "none"} stroke={c} strokeWidth="3" />)}</>)),
  xd("schnoerkel", "Schnörkel", 4, 280, gold, (c) => S(320, 80, <path d="M160 40 C130 6 90 20 104 42 C114 58 136 46 126 34 M104 42 C70 70 30 60 8 34 M160 40 C190 6 230 20 216 42 C206 58 184 46 194 34 M216 42 C250 70 290 60 312 34 M160 52 l7 9 l-7 9 l-7 -9 Z" stroke={c} strokeWidth="3.5" fill="none" />)),
  xd("baumdoodle", "Baum-Doodle", 0.75, 110, green, (c) => S(75, 100, <><path d="M38 14 C24 30 54 30 36 40 C18 50 62 48 40 60 C10 74 72 66 42 80 C4 92 70 92 66 86" stroke={c} strokeWidth="4" fill="none" /><path transform="translate(38 10) scale(.45)" d={starPath} fill={gold} /><path d="M38 90 V98" stroke="#7a5b3e" strokeWidth="5" /></>)),
  xd("mistel", "Mistelzweig", 1, 100, green, (c) => S(100, 100, <><path d="M50 6 V34 M50 34 C40 46 32 54 26 66 M50 34 C60 46 68 54 74 66" stroke="#7a5b3e" strokeWidth="3" fill="none" />{[[26, 66, 205], [74, 66, 155], [38, 50, 250], [62, 50, 110], [50, 40, 180]].map(([px, py, r]) => <g key={r} transform={`translate(${px} ${py}) rotate(${r})`}><path d={leaf} transform="scale(.65 .75)" fill={c} /></g>)}<circle cx="43" cy="42" r="6" fill="#fffaf0" stroke={ink} /><circle cx="56" cy="43" r="6" fill="#fffaf0" stroke={ink} /></>)),
  xd("tannenwald", "Tannenwald", 2.6, 280, "#5b7a62", (c) => S(260, 100, <>{[[24, 40], [62, 62], [104, 50], [146, 78], [190, 56], [232, 42]].map(([px, h], i) => <path key={px} d={`M${px} ${94 - h} L${px + h * 0.28} 94 H${px - h * 0.28} Z`} fill={c} opacity={i % 2 ? 1 : 0.6} />)}<path d="M4 95 C80 90 180 99 256 94" stroke={c} strokeWidth="3" fill="none" /></>)),

  // Anhänger und Zettel mit eigenem Text
  tag("tag-kraft", "Anhänger Kraft", 1.9, 250, "#c8a67c", (c) => S(190, 100, <><path d="M34 6 H184 V94 H34 L6 66 V34 Z" fill={c} /><path d="M38 13 H177 V87 H38 L14 63 V37 Z" fill="none" stroke="#fff6e4" strokeWidth="1.6" strokeDasharray="5 5" /><circle cx="26" cy="50" r="8" fill="#f4ead8" stroke="#7a5b3e" strokeWidth="2" /><path d="M26 50 C6 46 6 14 -4 8" stroke={red} strokeWidth="3" fill="none" /></>), { label: { text: "Für …", color: ink, left: 22, size: 0.13 } }),
  tag("tag-creme", "Anhänger Creme", 1.9, 250, "#fbf3e4", (c) => S(190, 100, <><rect x="4" y="4" width="182" height="92" rx="14" fill={c} stroke="#d9c7a6" strokeWidth="2" /><circle cx="22" cy="50" r="7" fill="#e9dcc2" stroke={gold} strokeWidth="2" /><path d="M150 92 C160 76 172 78 182 66" stroke={green} strokeWidth="3" fill="none" />{[[156, 84, 320], [166, 78, 30], [174, 72, 340]].map(([px, py, r]) => <g key={px} transform={`translate(${px} ${py}) rotate(${r})`}><path d={leaf} transform="scale(.4)" fill={green} /></g>)}<circle cx="160" cy="88" r="4" fill={red} /></>), { label: { text: "Von …", color: ink, left: 16, size: 0.13 } }),
  tag("tag-gruen", "Anhänger Grün", 1.9, 250, "#2f5040", (c) => S(190, 100, <><path d="M34 6 H184 V94 H34 L6 66 V34 Z" fill={c} /><path d="M39 14 H176 V86 H39 L15 62 V38 Z" fill="none" stroke="#d8b25c" strokeWidth="2" /><circle cx="27" cy="50" r="7" fill="#f4ead8" /><path transform="translate(166 24) scale(.4)" d={starPath} fill="#d8b25c" /></>), { label: { text: "Frohes Fest", color: "#f4e6c4", left: 22, size: 0.12 } }),
  tag("tag-rot", "Anhänger Rot", 0.72, 170, "#8c2f35", (c) => S(72, 100, <><path d="M36 4 L64 22 V94 H8 V22 Z" fill={c} /><circle cx="36" cy="18" r="5" fill="#f4ead8" /><path d="M14 34 H58 M14 88 H58" stroke="#f4e6c4" strokeWidth="1.5" /></>), { label: { text: "Wunsch\nNr. 1", color: "#f7ead0", left: 0, top: 22, size: 0.17 } }),
  tag("banner", "Banner", 4, 360, "#8c2f35", (c) => S(400, 100, <><path d="M4 30 H60 V88 H4 L22 59 Z M396 30 H340 V88 H396 L378 59 Z" fill={c} opacity=".75" /><path d="M42 12 H358 V70 H42 Z" fill={c} /><path d="M42 70 L60 88 V70 Z M358 70 L340 88 V70 Z" fill="#000" opacity=".35" /></>), { label: { text: "Meine Wünsche", color: "#f7ead0", left: 0, bottom: 18, size: 0.09 } }),
  tag("poststempel", "Nordpol-Stempel", 1, 130, red, (c) => S(120, 120, <g fill="none" stroke={c} strokeWidth="3" opacity=".8"><circle cx="60" cy="60" r="54" /><circle cx="60" cy="60" r="38" strokeDasharray="4 5" /><path d="M8 48 C30 40 50 56 72 48 S100 46 114 50 M8 74 C30 66 50 82 72 74 S100 72 114 76" opacity=".5" /><path d="M60 34 L74 56 H67 L80 76 H40 L53 56 H46 Z M60 76 V86" /></g>)),
  z("briefmarke", "Briefmarke", 0.8, 120, "#fbf3e4", (c) => S(80, 100, <><path d={`M5 5 ${Array.from({ length: 7 }, () => "h3 a3.5 3.5 0 0 0 7 0").join(" ")} V95 H5 Z`} fill={c} stroke="#d9c7a6" /><rect x="13" y="16" width="54" height="66" fill="#e3a993" /><path transform="translate(40 50) scale(1)" d={heart} fill="#a3343c" /></>)),
  z("papierfetzen", "Gerissenes Papier", 1.8, 260, "#fbf3e4", (c) => S(180, 100, <><path d="M6 12 L24 8 L40 13 L62 7 L88 12 L112 7 L136 12 L158 7 L174 12 L172 34 L176 58 L171 90 L150 94 L128 89 L104 95 L78 90 L54 95 L30 90 L8 94 L4 66 L9 40 Z" fill="#000" opacity=".1" transform="translate(2 3)" /><path d="M6 12 L24 8 L40 13 L62 7 L88 12 L112 7 L136 12 L158 7 L174 12 L172 34 L176 58 L171 90 L150 94 L128 89 L104 95 L78 90 L54 95 L30 90 L8 94 L4 66 L9 40 Z" fill={c} /></>), { label: { text: "Notiz …", color: ink, left: 0, size: 0.12 } }),
  z("spitze", "Spitzendeckchen", 1, 200, "#fffdf8", (c) => S(120, 120, <>{Array.from({ length: 18 }, (_, i) => <circle key={i} cx="60" cy="12" r="10" fill={c} stroke="#e3d6c2" transform={`rotate(${i * 20} 60 60)`} />)}<circle cx="60" cy="60" r="47" fill={c} />{Array.from({ length: 18 }, (_, i) => <circle key={i} cx="60" cy="17" r="2.6" fill="#e3d6c2" transform={`rotate(${i * 20 + 10} 60 60)`} />)}<circle cx="60" cy="60" r="34" fill="none" stroke="#e3d6c2" strokeWidth="2" strokeDasharray="3 5" /></>), { label: { text: "♡", color: "#b5573b", left: 0, size: 0.2 } }),
  z("sprechblase", "Sprechblase", 1.4, 200, "#ffffff", (c) => S(140, 100, <path d="M14 10 C50 2 100 4 126 12 C138 30 136 56 124 70 C96 78 70 76 56 76 L34 96 L38 74 C10 72 2 30 14 10 Z" fill={c} stroke={ink} strokeWidth="2.5" />), { label: { text: "Bitte!", color: ink, left: 0, bottom: 20, size: 0.16 } }),

  // Alltag
  a("pilz", "Pilz", 0.9, 85, "#b5473b", (c) => S(90, 100, <><path d="M34 52 C36 70 30 84 28 94 H62 C60 84 54 70 56 52 Z" fill="#f6ead6" stroke={ink} strokeWidth="2" /><path d="M6 54 C8 20 30 8 45 8 C60 8 82 20 84 54 C60 62 30 62 6 54 Z" fill={c} stroke={ink} strokeWidth="2" /><circle cx="30" cy="30" r="7" fill="#fff6e6" /><circle cx="56" cy="24" r="5" fill="#fff6e6" /><circle cx="64" cy="44" r="7" fill="#fff6e6" /><circle cx="40" cy="48" r="4" fill="#fff6e6" /></>)),
  a("tasse", "Kakaotasse", 1.1, 100, "#e3a993", (c) => S(110, 100, <><path d="M36 22 C30 14 42 12 36 4 M54 22 C48 14 60 12 54 4" stroke="#a5917e" strokeWidth="3" fill="none" /><path d="M14 34 H78 L72 86 C70 94 22 94 20 86 Z" fill={c} stroke={ink} strokeWidth="2" /><path d="M77 44 C104 40 100 76 73 72" stroke={ink} strokeWidth="6" fill="none" /><ellipse cx="46" cy="34" rx="32" ry="9" fill="#6f4630" stroke={ink} strokeWidth="2" /><rect x="34" y="28" width="11" height="9" rx="3" fill="#fffdf8" /><rect x="48" y="30" width="11" height="9" rx="3" fill="#fffdf8" /><path transform="translate(46 64) scale(.8)" d={heart} fill="#fffaf0" /></>)),
  a("buch", "Bücherstapel", 1.3, 120, "#7d8b63", (c) => S(130, 100, <><rect x="14" y="66" width="100" height="24" rx="3" fill={c} stroke={ink} strokeWidth="2" /><rect x="22" y="42" width="92" height="24" rx="3" fill="#b5573b" stroke={ink} strokeWidth="2" /><rect x="10" y="18" width="90" height="24" rx="3" fill="#e3c27e" stroke={ink} strokeWidth="2" /><path d="M26 66 V90 M34 42 V66 M22 18 V42" stroke="#fff6e4" strokeWidth="4" /></>)),
  a("kamera", "Kamera", 1.3, 110, "#b8a08a", (c) => S(130, 100, <><rect x="8" y="26" width="114" height="66" rx="10" fill={c} stroke={ink} strokeWidth="2.2" /><path d="M42 26 L50 12 H80 L88 26" fill={c} stroke={ink} strokeWidth="2.2" /><rect x="8" y="42" width="114" height="30" fill="#4a3e35" opacity=".85" /><circle cx="65" cy="58" r="25" fill="#f4ead8" stroke={ink} strokeWidth="2.2" /><circle cx="65" cy="58" r="15" fill="#5d6f78" /><circle cx="60" cy="53" r="5" fill="#fff" opacity=".6" /></>)),
  a("trockenblume", "Trockenblumen", 0.7, 110, "#d9a88e", (c) => S(70, 100, <><path d="M35 98 C34 70 20 50 14 26 M35 98 C35 66 36 40 36 14 M35 98 C36 72 52 54 58 30" stroke="#8d8a62" strokeWidth="2.2" fill="none" />{[[14, 22], [36, 12], [58, 26], [24, 46], [48, 44]].map(([px, py]) => <g key={px}>{[0, 60, 120, 180, 240, 300].map((r) => <circle key={r} cx={px} cy={py - 5} r="4.2" fill={c} transform={`rotate(${r} ${px} ${py})`} />)}<circle cx={px} cy={py} r="3" fill="#b8862f" /></g>)}<path d="M26 80 C35 86 37 86 46 80" stroke="#b5573b" strokeWidth="5" fill="none" /></>)),
  a("siegel", "Wachssiegel", 1, 90, "#8c2f35", (c) => S(100, 100, <><path d="M50 5 C64 2 72 14 84 18 C98 26 92 42 96 54 C96 70 82 74 76 86 C64 98 50 92 38 95 C22 94 20 80 10 72 C0 58 10 46 8 34 C12 18 26 18 34 9 C40 5 45 6 50 5 Z" fill={c} /><circle cx="50" cy="50" r="30" fill="none" stroke="#000" opacity=".25" strokeWidth="4" /><path transform="translate(50 50)" d={heart} fill="none" stroke="#fff" opacity=".6" strokeWidth="3" /></>)),
  a("sonne", "Sonne", 1, 100, "#e2b04a", (c) => S(100, 100, <><circle cx="50" cy="50" r="21" fill={c} />{Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30} 50 50)`} d={i % 2 ? "M50 20 V10" : "M50 20 V4"} stroke={c} strokeWidth="5" />)}</>)),
  a("regenbogen", "Regenbogen", 1.6, 130, "#b5573b", (c) => S(160, 100, <g fill="none" strokeWidth="13" strokeLinecap="butt"><path d="M14 92 A66 70 0 0 1 146 92" stroke={c} /><path d="M30 92 A50 54 0 0 1 130 92" stroke="#e3a993" /><path d="M46 92 A34 38 0 0 1 114 92" stroke="#e6c987" /><path d="M62 92 A18 22 0 0 1 98 92" stroke="#9aa783" /></g>), { fixedColor: true }),

  d("krone", "Krone-Doodle", 1.5, 110, "#c79a3f", (c) => S(120, 80, <path d="M14 66 L8 22 L36 44 L60 10 L84 44 L112 22 L106 66 Z M14 74 H106" fill="none" stroke={c} strokeWidth="4" />)),
  d("spirale", "Spirale", 1, 80, ink, (c) => S(100, 100, <path d="M50 52 C54 46 62 52 58 60 C52 70 36 64 38 48 C42 30 70 30 74 52 C78 78 44 90 28 72 C10 48 28 14 56 14" stroke={c} strokeWidth="4" fill="none" />)),
  d("smiley", "Smiley", 1, 80, ink, (c) => S(100, 100, <><path d="M50 8 C80 6 96 30 92 54 C88 80 64 94 42 90 C18 84 4 62 10 38 C16 20 32 9 54 9" stroke={c} strokeWidth="4" fill="none" /><path d="M36 36 V46 M62 34 V44 M30 60 C40 76 62 74 70 58" stroke={c} strokeWidth="4" fill="none" /></>)),
  d("kreuzchen", "Kreuzchen-Muster", 1.6, 120, "#b5573b", (c) => S(160, 100, <path d="M20 20 l16 16 m0 -16 l-16 16 M70 12 l14 14 m0 -14 l-14 14 M122 28 l16 16 m0 -16 l-16 16 M42 62 l14 14 m0 -14 l-14 14 M96 66 l16 16 m0 -16 l-16 16" stroke={c} strokeWidth="4" />)),
  d("rahmen", "Doodle-Rahmen", 1.3, 260, ink, (c) => S(130, 100, <path d="M8 10 C48 6 88 12 122 8 C126 38 120 66 124 92 C84 96 44 90 8 94 C4 64 10 36 8 10 M12 6 C10 40 4 70 10 98 M4 90 C50 98 90 88 128 94" stroke={c} strokeWidth="2" fill="none" />)),
  d("wimpel", "Wimpelkette", 4, 360, "#b5573b", (c) => S(400, 100, <><path d="M4 14 C120 60 280 60 396 14" stroke={ink} strokeWidth="3" fill="none" />{[[40, 28], [96, 42], [152, 49], [208, 50], [264, 45], [320, 35]].map(([px, py], i) => <path key={px} d={`M${px - 20} ${py - 3} L${px + 22} ${py} L${px} ${py + 42} Z`} fill={[c, "#e6c987", "#9aa783"][i % 3]} stroke={ink} strokeWidth="1.5" />)}</>)),
  d("wellen", "Wellenlinie", 6, 260, "#7d8b63", (c) => S(240, 40, <path d="M6 20 C22 0 34 0 48 20 S76 40 92 20 S120 0 136 20 S164 40 180 20 S208 0 234 20" stroke={c} strokeWidth="4" fill="none" />)),
  d("ausrufe", "Aufmerksamkeits-Strahlen", 1, 80, "#b5573b", (c) => S(100, 100, <path d="M22 82 L10 54 M40 66 L38 26 M60 64 L80 30 M76 80 L96 66" stroke={c} strokeWidth="6" />)),
];
