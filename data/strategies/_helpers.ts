import type {
  DiagramComponent,
  DiagramConnection,
  Lab,
  LabStep,
  LocalizedString,
  QuizQuestion,
  TroubleshootingScenario,
} from "@/lib/types";
import { L } from "@/lib/types";
import {
  kindCleanup,
  kindSetupBasic,
  minikubeAlt,
} from "@data/labs/kind";

export { L };

export function q(
  id: string,
  prompt: LocalizedString,
  choices: LocalizedString[],
  correctIndex: number,
  explanation: LocalizedString,
): QuizQuestion {
  return { id, prompt, choices, correctIndex, explanation };
}

export function labStep(
  id: string,
  title: LocalizedString,
  snippet: { language: "bash" | "yaml"; title: string; code: string },
  expectedOutput: string,
  whatHappened: LocalizedString,
  diagramComponentIds?: string[],
  diagramConnectionIds?: string[],
): LabStep {
  return {
    id,
    title,
    command: snippet,
    expectedOutput,
    whatHappened,
    diagramComponentIds,
    diagramConnectionIds,
  };
}

export function basicLab(steps: LabStep[], exercise: Lab["exercise"]): Lab {
  return {
    kindSetup: kindSetupBasic,
    minikubeAlt,
    steps,
    exercise,
    cleanup: kindCleanup,
  };
}

export function troubleshoot(
  id: string,
  symptom: LocalizedString,
  choices: TroubleshootingScenario["choices"],
  diagnosticCommands: TroubleshootingScenario["diagnosticCommands"],
  cause: LocalizedString,
  fix: LocalizedString,
): TroubleshootingScenario {
  return { id, symptom, choices, diagnosticCommands, cause, fix };
}

export function comp(
  partial: Omit<DiagramComponent, "whyThere" | "description"> &
    Partial<Pick<DiagramComponent, "whyThere" | "description">>,
): DiagramComponent {
  return {
    description: partial.description ?? partial.label,
    whyThere: partial.whyThere ?? "",
    ...partial,
  };
}

export function conn(
  id: string,
  from: string,
  to: string,
  label: string,
  highlight = true,
  stepIds?: string[],
): DiagramConnection {
  return { id, from, to, label, highlight, stepIds };
}
