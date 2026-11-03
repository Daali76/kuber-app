export type Maturity = "Graduated" | "Incubating" | "Sandbox" | "External";

export type LayerId =
  | "infrastructure"
  | "runtime"
  | "orchestration"
  | "networking"
  | "storage"
  | "delivery"
  | "observability"
  | "security";

export interface ToolLevels {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface ToolAlternative {
  id: string;
  comparison: string;
}

export interface Tool {
  id: string;
  name: string;
  layer: LayerId;
  maturity: Maturity;
  summary: string;
  problem: string;
  levels: ToolLevels;
  useWhen: string[];
  avoidWhen: string[];
  alternatives: ToolAlternative[];
  connectsTo: {
    upstream: string[];
    downstream: string[];
  };
  example: {
    language: "yaml" | "bash" | "hcl";
    title: string;
    code: string;
  };
  docsUrl: string;
  repoUrl: string;
}

export interface LayerMeta {
  id: LayerId;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  accentSoft: string;
  order: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  toolIds: string[];
}

export type Priority = "simplicity" | "security" | "observability";
export type Scale = "small" | "medium" | "large";
export type Environment = "cloud" | "on-prem" | "hybrid";
export type TeamSize = "solo" | "small" | "medium" | "large";
