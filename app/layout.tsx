import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Great_Vibes, Fredoka, Caveat, Permanent_Marker, Mountains_of_Christmas, Special_Elite, Homemade_Apple, Amatic_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
// Handschrift: als --font-caveat geladen, globals.css stellt sie als --font-hand bereit
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });
// Zusätzliche Schriften fürs Scrapbook
const xmas = Mountains_of_Christmas({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-xmas" });
const typewriter = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-typewriter" });
const feder = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--font-feder" });
const amatic = Amatic_SC({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-amatic" });

export const metadata: Metadata = {
  title: "Wunschwerk – Wünsche sammeln, schön gestalten, teilen",
  description: "Merke dir Wünsche aus jedem Shop und gestalte daraus einen schönen Wunschzettel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${cormorant.variable} ${script.variable} ${fredoka.variable} ${caveat.variable} ${marker.variable} ${xmas.variable} ${typewriter.variable} ${feder.variable} ${amatic.variable}`}
    >
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
