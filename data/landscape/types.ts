export type LandscapeProject =
  | "graduated"
  | "incubating"
  | "sandbox"
  | "archived";

export interface LandscapeCatalogItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description?: string;
  homepage_url?: string;
  repo_url?: string;
  logo?: string;
  project?: LandscapeProject;
  accepted?: string;
  incubating?: string;
  graduated?: string;
}

export interface LandscapeCatalog {
  generatedAt: string;
  itemCount: number;
  maturityCounts?: {
    graduated: number;
    incubating: number;
    sandbox: number;
    archived: number;
  };
  items: LandscapeCatalogItem[];
}
