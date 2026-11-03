import catalogJson from "./catalog.json";
import type { LandscapeCatalog, LandscapeCatalogItem } from "./types";

export const landscapeCatalog = catalogJson as unknown as LandscapeCatalog;

export function getCatalogItem(id: string): LandscapeCatalogItem | undefined {
  return landscapeCatalog.items.find((item) => item.id === id);
}

export function getCatalogCategories(): string[] {
  const set = new Set(landscapeCatalog.items.map((i) => i.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getSubcategoriesForCategory(category: string): string[] {
  const set = new Set(
    landscapeCatalog.items
      .filter((i) => i.category === category)
      .map((i) => i.subcategory),
  );
  return [...set].sort((a, b) => a.localeCompare(b));
}
