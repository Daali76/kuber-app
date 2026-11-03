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
  summary: string;
  problem: string;
  whyItExists: string;
  analogy: string;
  howItWorks: string[];
  prerequisiteLessons: string[];
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
  flows: DiagramFlow[];
  lab: Lab;
  quiz: QuizQuestion[];
  troubleshooting: TroubleshootingScenario[];
}

export interface Lesson {
  id: string;
  order: number;
  title: LocalizedString;
  analogy: LocalizedString;
  explanation: LocalizedString[];
  diagramHighlights: {
    componentIds: string[];
    connectionIds?: string[];
  };
  keyCommands: CodeSnippet[];
  quiz: QuizQuestion[];
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
  continue?: { kind: "lesson" | "tool" | "lab"; id: string; href: string };
}
