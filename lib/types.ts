export type TemplateId = "journal" | "weihnachten" | "geburtstag" | "hochzeit" | "minimal";
export type LayoutId = "raster" | "liste";

export interface Wish {
  id: string;
  url?: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  shop?: string;
  note?: string;
  /** 1 = nett, 2 = schön, 3 = Herzenswunsch */
  priority: 1 | 2 | 3;
  /** Für Gäste ausgeblendet */
  hidden?: boolean;
}

export interface WishList {
  id: string;
  /** Kurzer Teilen-Link (/w/slug), nur bei Listen im Konto */
  slug?: string;
  title: string;
  subtitle: string;
  template: TemplateId;
  layout: LayoutId;
  wishes: Wish[];
  /** Freie Scrapbook-Gestaltung. Fehlt sie, wird die Vorlage benutzt. */
  design?: Design | null;
  createdAt: number;
  updatedAt: number;
}

export interface ProductPreview {
  title?: string;
  image?: string;
  price?: number;
  currency?: string;
  shop?: string;
}

export interface Reservation {
  wish_id: string;
  name: string;
}

export interface SharedList extends Pick<WishList, "title" | "subtitle" | "template" | "layout" | "wishes" | "design"> {
  is_owner?: boolean;
  reservations?: Reservation[];
}

export type PaperId = "creme" | "kariert" | "punkte" | "liniert" | "kraft" | "rosa" | "salbei" | "nacht" | "kraftsterne" | "tartan" | "schnee" | "goldpunkte" | "zuckerstange" | "vichyrot" | "schneekraft";
export type FontId = "hand" | "marker" | "schreib" | "serif" | "rund" | "weihnacht" | "maschine" | "schwung" | "feder" | "amatic";

export interface DesignItem {
  id: string;
  kind: "wish" | "sticker" | "text" | "image";
  /** Mittelpunkt auf der Seite (Seite ist 1000 × 1400) */
  x: number;
  y: number;
  /** Breite auf der Seite (bei Texten: Größe) */
  w: number;
  /** Drehung in Grad */
  rot: number;
  z: number;
  wishId?: string;
  sticker?: string;
  text?: string;
  font?: FontId;
  color?: string;
  /** Dicke von Washi-Tape auf der Seite */
  h?: number;
  /** Eigenes Bild: Daten-URL, oder Link bei Pinterest-Pins */
  src?: string;
  /** Seitenverhältnis Breite / Höhe bei Bildern */
  ratio?: number;
  frame?: "ohne" | "sticker" | "polaroid";
  /** Quelle bei Pins */
  link?: string;
  credit?: string;
}

export interface Design {
  /** true = Vorlage benutzen, Scrapbook bleibt aber gespeichert */
  off?: boolean;
  paper: PaperId;
  items: DesignItem[];
}
