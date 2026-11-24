import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Schriften liegen im Projekt (app/fonts), damit der Build nicht von Google Fonts abhängt
const inter = localFont({ src: "./fonts/inter-normal-100-900.woff2", weight: "100 900", variable: "--font-inter" });
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-normal-400-600.woff2", weight: "400 600", style: "normal" },
    { path: "./fonts/cormorant-italic-400-600.woff2", weight: "400 600", style: "italic" },
  ],
  variable: "--font-cormorant",
});
const script = localFont({ src: "./fonts/greatvibes-normal-400.woff2", weight: "400", variable: "--font-greatvibes" });
const fredoka = localFont({ src: "./fonts/fredoka-normal-300-700.woff2", weight: "300 700", variable: "--font-fredoka" });
// Handschrift: als --font-caveat geladen, globals.css stellt sie als --font-hand bereit
const caveat = localFont({ src: "./fonts/caveat-normal-400-700.woff2", weight: "400 700", variable: "--font-caveat" });
const marker = localFont({ src: "./fonts/marker-normal-400.woff2", weight: "400", variable: "--font-marker" });
// Nur im Scrapbook gebraucht, darum nicht vorab laden
const weihnacht = localFont({ src: "./fonts/weihnacht-normal-700.woff2", weight: "700", variable: "--font-weihnacht", preload: false });
const maschine = localFont({ src: "./fonts/maschine-normal-400.woff2", weight: "400", variable: "--font-maschine", preload: false });
const feder = localFont({ src: "./fonts/feder-normal-400.woff2", weight: "400", variable: "--font-feder", preload: false });
const amatic = localFont({
  src: [
    { path: "./fonts/amatic-normal-400.woff2", weight: "400" },
    { path: "./fonts/amatic-normal-700.woff2", weight: "700" },
  ],
  variable: "--font-amatic",
  preload: false,
});
const schwung = localFont({ src: "./fonts/schwung-normal-400.woff2", weight: "400", variable: "--font-schwung", preload: false });

// Absolute Adresse für Vorschaubilder (WhatsApp & Co. brauchen die öffentliche Adresse)
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Wunschwerk – Wünsche sammeln, schön gestalten, teilen",
  description: "Merke dir Wünsche aus jedem Shop und gestalte daraus einen schönen Wunschzettel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${cormorant.variable} ${script.variable} ${fredoka.variable} ${caveat.variable} ${marker.variable} ${weihnacht.variable} ${maschine.variable} ${schwung.variable} ${feder.variable} ${amatic.variable}`}
    >
      <body className="font-sans antialiased min-h-screen">{children}</body>
    </html>
  );
}
