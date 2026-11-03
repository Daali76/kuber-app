import type { Strategy } from "@/lib/types";
import { appOfApps } from "./app-of-apps";
import { applicationSet } from "./applicationset";
import { argoCdApplication } from "./argocd-application";
import { blueGreenArgoRollouts } from "./blue-green-argo-rollouts";
import { canaryArgoRollouts } from "./canary-argo-rollouts";
import { compareStrategies } from "./compare-strategies";
import { helmVsKustomize } from "./helm-vs-kustomize";
import { kustomizeArgoCd } from "./kustomize-argocd";
import { recreate } from "./recreate";
import { rollingUpdate } from "./rolling-update";

export const strategies: Strategy[] = [
  rollingUpdate,
  recreate,
  canaryArgoRollouts,
  blueGreenArgoRollouts,
  compareStrategies,
  argoCdApplication,
  appOfApps,
  applicationSet,
  kustomizeArgoCd,
  helmVsKustomize,
];

export function getStrategy(id: string): Strategy | undefined {
  return strategies.find((s) => s.id === id);
}

export const strategyCount = strategies.length;
