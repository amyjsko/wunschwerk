export function formatPrice(price?: number, currency = "EUR"): string | null {
  if (price == null || Number.isNaN(price)) return null;
  try {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(price);
  } catch {
    return `${price.toFixed(2).replace(".", ",")} ${currency}`;
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
