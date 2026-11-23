import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Great_Vibes, Fredoka, Caveat, Permanent_Marker, Mountains_of_Christmas, Special_Elite, Berkshire_Swash } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-greatvibes" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
// Handschrift: als --font-caveat geladen, globals.css stellt sie als --font-hand bereit
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });
// Nur im Scrapbook gebraucht, darum nicht vorab laden
const weihnacht = Mountains_of_Christmas({ subsets: ["latin"], weight: "700", variable: "--font-weihnacht", preload: false });
const maschine = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-maschine", preload: false });
const schwung = Berkshire_Swash({ subsets: ["latin"], weight: "400", variable: "--font-schwung", preload: false });

export const metadata: Metadata = {
  title: "Wunschwerk – Wünsche sammeln, schön gestalten, teilen",
  description: "Merke dir Wünsche aus jedem Shop und gestalte daraus einen schönen Wunschzettel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${cormorant.variable} ${script.variable} ${fredoka.variable} ${caveat.variable} ${marker.variable} ${weihnacht.variable} ${maschine.variable} ${schwung.variable}`}
    >
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
