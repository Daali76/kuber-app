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

export type K8sObjectType =
  | "Deployment"
  | "DaemonSet"
  | "StatefulSet"
  | "Pod"
  | "Service"
  | "Ingress"
  | "CRD"
  | "ValidatingWebhook"
  | "MutatingWebhook"
  | "Sidecar"
  | "Namespace"
  | "Secret"
  | "ConfigMap"
  | "Operator"
  | "ControlPlane"
  | "NodeProcess"
  | "External"
  | "CLI";

export type DiagramZone =
  | "external"
  | "control-plane"
  | "worker-node"
  | "namespace"
  | "pod";

export interface ToolLevels {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface ToolAlternative {
  id: string;
  comparison: string;
}

export interface DiagramComponent {
  id: string;
  label: string;
  zone: DiagramZone;
  /** Sub-slot inside the zone for layout hints */
  slot?: string;
  objectType: K8sObjectType;
  description: string;
  whyThere: string;
  /** Belongs to this tool (highlighted by default on Diagram tab) */
  highlight: boolean;
  /** Which implement steps introduce this component */
  stepIds?: string[];
}

export interface DiagramConnection {
  id: string;
  from: string;
  to: string;
  label: string;
  highlight: boolean;
  stepIds?: string[];
}

export interface CodeSnippet {
  language: "bash" | "yaml" | "text";
  title: string;
  code: string;
}

export interface ImplementStep {
  id: string;
  title: string;
  description: string;
  code?: CodeSnippet;
  expectedOutput?: string;
  /** Diagram pieces revealed / focused on this step */
  diagramComponentIds: string[];
  diagramConnectionIds?: string[];
}

export interface ToolDiagram {
  components: DiagramComponent[];
  connections: DiagramConnection[];
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
  docsUrl: string;
  repoUrl: string;
  /** Short placement blurb shown on home map pins */
  placementBlurb: string;
  diagram: ToolDiagram;
  implement: ImplementStep[];
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
