import type { Metadata } from "next";
import { Inter, Playfair_Display, Great_Vibes, Fredoka, Caveat, Permanent_Marker } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const script = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });

export const metadata: Metadata = {
  title: "Wunschwerk – Wünsche sammeln, schön gestalten, teilen",
  description: "Merke dir Wünsche aus jedem Shop und gestalte daraus einen schönen Wunschzettel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${playfair.variable} ${script.variable} ${fredoka.variable} ${hand.variable} ${marker.variable}`}>
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
