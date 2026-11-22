export type TemplateId = "weihnachten" | "geburtstag" | "hochzeit" | "minimal";
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
}

export interface WishList {
  id: string;
  title: string;
  subtitle: string;
  template: TemplateId;
  layout: LayoutId;
  wishes: Wish[];
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
