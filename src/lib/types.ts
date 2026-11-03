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

export type Lang = "en" | "fa";

export interface LocalizedString {
  en: string;
  fa: string;
}

export interface ToolLevels {
  beginner: LocalizedString;
  intermediate: LocalizedString;
  advanced: LocalizedString;
}

export interface ToolAlternative {
  id: string;
  comparison: LocalizedString;
}

export interface DiagramComponent {
  id: string;
  label: string;
  zone: DiagramZone;
  slot?: string;
  objectType: K8sObjectType;
  description: string;
  whyThere: string;
  highlight: boolean;
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

export interface DiagramFlowStep {
  caption: LocalizedString;
  connectionIds?: string[];
  componentIds?: string[];
}

export interface DiagramFlow {
  id: string;
  title: LocalizedString;
  steps: DiagramFlowStep[];
}

export interface CodeSnippet {
  language: "bash" | "yaml" | "text";
  title: string;
  code: string;
}

export interface ImplementStep {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  code?: CodeSnippet;
  expectedOutput?: string;
  diagramComponentIds: string[];
  diagramConnectionIds?: string[];
}

export interface ToolDiagram {
  components: DiagramComponent[];
  connections: DiagramConnection[];
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedString;
  choices: LocalizedString[];
  correctIndex: number;
  explanation: LocalizedString;
}

export interface LabStep {
  id: string;
  title: LocalizedString;
  command: CodeSnippet;
  expectedOutput: string;
  whatHappened: LocalizedString;
  diagramComponentIds?: string[];
  diagramConnectionIds?: string[];
}

export interface Lab {
  kindSetup: LabStep;
  minikubeAlt?: LabStep;
  steps: LabStep[];
  exercise: {
    prompt: LocalizedString;
    solution: CodeSnippet;
  };
  cleanup: LabStep;
}

export interface TroubleshootingChoice {
  label: LocalizedString;
  correct: boolean;
  feedback: LocalizedString;
}

export interface TroubleshootingScenario {
  id: string;
  symptom: LocalizedString;
  choices: TroubleshootingChoice[];
  diagnosticCommands: CodeSnippet[];
  cause: LocalizedString;
  fix: LocalizedString;
}

export interface Tool {
  id: string;
  name: string;
  layer: LayerId;
  maturity: Maturity;
  summary: LocalizedString;
  problem: LocalizedString;
  whyItExists: LocalizedString;
  analogy: LocalizedString;
  howItWorks: LocalizedString[];
  prerequisiteLessons: string[];
  levels: ToolLevels;
  useWhen: LocalizedString[];
  avoidWhen: LocalizedString[];
  alternatives: ToolAlternative[];
  docsUrl: string;
  repoUrl: string;
  placementBlurb: LocalizedString;
  diagram: ToolDiagram;
  implement: ImplementStep[];
  flows: DiagramFlow[];
  lab: Lab;
  quiz: QuizQuestion[];
  troubleshooting: TroubleshootingScenario[];
}

export interface LessonBuildStep {
  componentIds: string[];
  connectionIds?: string[];
  caption: LocalizedString;
}

export interface Lesson {
  id: string;
  order: number;
  moduleId?: string;
  title: LocalizedString;
  analogy: LocalizedString;
  explanation: LocalizedString[];
  objectives?: LocalizedString[];
  commonConfusion?: LocalizedString;
  summaryLines?: LocalizedString[];
  diagramHighlights: {
    componentIds: string[];
    connectionIds?: string[];
  };
  buildSteps?: LessonBuildStep[];
  flows?: DiagramFlow[];
  keyCommands: CodeSnippet[];
  quiz: QuizQuestion[];
}

export interface LearnModule {
  id: string;
  order: number;
  title: LocalizedString;
  goals: LocalizedString[];
  prerequisites: string[];
  lessonIds: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: LocalizedString;
  relatedLessonId?: string;
  relatedToolId?: string;
}

export interface LayerMeta {
  id: LayerId;
  name: LocalizedString;
  shortName: LocalizedString;
  description: LocalizedString;
  accent: string;
  accentSoft: string;
  order: number;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  toolIds: string[];
  prerequisiteLessonIds?: string[];
}

export type Priority = "simplicity" | "security" | "observability";
export type Scale = "small" | "medium" | "large";
export type Environment = "cloud" | "on-prem" | "hybrid";
export type TeamSize = "solo" | "small" | "medium" | "large";

export interface FlashcardState {
  id: string;
  due: number;
  interval: number;
  ease: number;
}

export interface AppProgress {
  version: 1;
  roadmap: Record<string, boolean>;
  lessons: Record<string, boolean>;
  labSteps: Record<string, boolean>;
  quizScores: Record<string, { correct: number; total: number; at: number }>;
  flashcards: Record<string, FlashcardState>;
  objectives?: Record<string, boolean>;
  modules?: Record<string, boolean>;
  continue?: { kind: "lesson" | "tool" | "lab"; id: string; href: string };
}

/** Helper for bilingual strings */
export function L(en: string, fa: string): LocalizedString {
  return { en, fa };
}

export type StrategyInteractive =
  | "rolling-sliders"
  | "canary-traffic"
  | "blue-green-promote"
  | "kustomize-diff"
  | "argocd-toggles"
  | "compare-table";

export interface KustomizeDiffOverlay {
  id: string;
  title: LocalizedString;
  baseYaml: string;
  renderedYaml: string;
  note?: LocalizedString;
}

/** Deployment strategy / GitOps pattern page (same learning shape as Tool). */
export interface Strategy {
  id: string;
  name: LocalizedString;
  category: "native" | "rollouts" | "gitops" | "compare";
  summary: LocalizedString;
  whyItExists: LocalizedString;
  analogy: LocalizedString;
  howItWorks: LocalizedString[];
  useWhen: LocalizedString[];
  avoidWhen: LocalizedString[];
  docsUrl: string;
  relatedToolIds?: string[];
  relatedStrategyIds?: string[];
  placementBlurb: LocalizedString;
  diagram: ToolDiagram;
  implement: ImplementStep[];
  flows: DiagramFlow[];
  /** Extra flows used for rollback / fail-analysis paths. */
  rollbackFlows?: DiagramFlow[];
  beforeAfter?: {
    beforeComponentIds: string[];
    afterComponentIds: string[];
  };
  lab: Lab;
  quiz: QuizQuestion[];
  troubleshooting: TroubleshootingScenario[];
  interactive?: StrategyInteractive;
  kustomizeDiffs?: KustomizeDiffOverlay[];
  compareRows?: {
    dimension: LocalizedString;
    rolling: LocalizedString;
    recreate: LocalizedString;
    canary: LocalizedString;
    blueGreen: LocalizedString;
  }[];
}
