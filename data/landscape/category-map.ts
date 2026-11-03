import type { LayerId } from "@/lib/types";

const DEFAULT_LAYER: LayerId = "orchestration";

/** Default layer when no subcategory override matches. */
export const categoryLayer: Record<string, LayerId> = {
  Provisioning: "infrastructure",
  Runtime: "runtime",
  "Orchestration & Management": "orchestration",
  "App Definition and Development": "delivery",
  "Observability and Analysis": "observability",
  Platform: "delivery",
  Serverless: "orchestration",
  Wasm: "runtime",
  Special: "orchestration",
  Data: "storage",
  "AI Agent": "orchestration",
  "AI Native Infra": "infrastructure",
  Inference: "runtime",
  Training: "infrastructure",
};

/**
 * Finer-grained mapping: `"Category / Subcategory"` → layer.
 * Hand-tuned against CNCF Landscape groupings.
 */
export const subcategoryLayer: Record<string, LayerId> = {
  "Provisioning / Automation & Configuration": "infrastructure",
  "Provisioning / Container Registry": "delivery",
  "Provisioning / Security & Compliance": "security",
  "Provisioning / Key Management": "security",
  "Runtime / Cloud Native Storage": "storage",
  "Runtime / Cloud Native Network": "networking",
  "Runtime / Container Runtime": "runtime",
  "Runtime / Runtimes": "runtime",
  "Runtime / Runtime": "runtime",
  "Orchestration & Management / Scheduling & Orchestration": "orchestration",
  "Orchestration & Management / Orchestration & Management": "orchestration",
  "Orchestration & Management / Coordination & Service Discovery": "networking",
  "Orchestration & Management / Service Mesh": "networking",
  "Orchestration & Management / Service Proxy": "networking",
  "Orchestration & Management / Remote Procedure Call": "networking",
  "Orchestration & Management / API Gateway": "networking",
  "Orchestration & Management / Gateway": "networking",
  "Orchestration & Management / Cloud Native Network": "networking",
  "Orchestration & Management / Security & Compliance": "security",
  "Orchestration & Management / Governance, Policy and Security": "security",
  "Orchestration & Management / Security": "security",
  "Orchestration & Management / Key Management": "security",
  "Orchestration & Management / Continuous Optimization": "observability",
  "Orchestration & Management / Chaos Engineering": "observability",
  "App Definition and Development / Continuous Integration & Delivery":
    "delivery",
  "App Definition and Development / Continuous Integration and Delivery":
    "delivery",
  "App Definition and Development / Application Definition & Image Build":
    "delivery",
  "App Definition and Development / Packaging, Registries & Application Delivery":
    "delivery",
  "App Definition and Development / Streaming & Messaging": "networking",
  "App Definition and Development / Database": "storage",
  "App Definition and Development / Application Frameworks": "delivery",
  "Observability and Analysis / Observability": "observability",
  "Observability and Analysis / Debugging & Observability": "observability",
  "Observability and Analysis / Continuous Optimization": "observability",
  "Observability and Analysis / Chaos Engineering": "observability",
  "Observability and Analysis / Feature Flagging": "delivery",
  "Platform / PaaS/Container Service": "orchestration",
  "Platform / Installable Platform": "orchestration",
  "Platform / Hosted Platform": "orchestration",
  "Platform / Hosted Platforms": "orchestration",
  "Serverless / Tools": "orchestration",
  "Serverless / Framework": "delivery",
  "Serverless / Embedded Functions": "runtime",
  "Serverless / Workload Runtime": "runtime",
  "Wasm / Runtime": "runtime",
  "Wasm / Orchestration & Management": "orchestration",
  "Data / Storage": "storage",
  "Data / Database": "storage",
  "Data / Vector Database": "storage",
  "Data / Streaming & Messaging": "networking",
  "Data / Data Architecture": "storage",
  "AI Native Infra / Orchestration and Scheduling": "orchestration",
  "AI Native Infra / Observability": "observability",
  "AI Agent / Agent Framework": "orchestration",
  "AI Agent / Agent Tool": "orchestration",
  "Training / Distributed Training": "infrastructure",
  "Inference / Model Asset and Registry": "delivery",
};

export function resolveLandscapeLayer(
  category: string,
  subcategory: string,
): LayerId {
  const key = `${category} / ${subcategory}`;
  return subcategoryLayer[key] ?? categoryLayer[category] ?? DEFAULT_LAYER;
}
