import type { LayerMeta } from "@/lib/types";

export const layers: LayerMeta[] = [
  {
    id: "infrastructure",
    name: {
      en: "Infrastructure & Provisioning",
      fa: "زیرساخت و آماده‌سازی",
    },
    shortName: { en: "Infra", fa: "زیرساخت" },
    description: {
      en: "Provision and manage cloud and cluster foundations.",
      fa: "آماده‌سازی و مدیریت پایهٔ cloud و کلاستر.",
    },
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.14)",
    order: 1,
  },
  {
    id: "runtime",
    name: { en: "Container Runtime", fa: "Container Runtime" },
    shortName: { en: "Runtime", fa: "Runtime" },
    description: {
      en: "Run containers via CRI-compatible engines.",
      fa: "اجرای container با موتورهای سازگار با CRI.",
    },
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.14)",
    order: 2,
  },
  {
    id: "orchestration",
    name: {
      en: "Orchestration & Scheduling",
      fa: "Orchestration و زمان‌بندی",
    },
    shortName: { en: "Orchestration", fa: "Orchestration" },
    description: {
      en: "Schedule workloads and scale cluster capacity.",
      fa: "زمان‌بندی بارکاری و مقیاس ظرفیت کلاستر.",
    },
    accent: "#38bdf8",
    accentSoft: "rgba(56, 189, 248, 0.14)",
    order: 3,
  },
  {
    id: "networking",
    name: {
      en: "Networking & Service Mesh",
      fa: "شبکه و Service Mesh",
    },
    shortName: { en: "Networking", fa: "شبکه" },
    description: {
      en: "Connect services, discover endpoints, and shape traffic.",
      fa: "اتصال سرویس‌ها، کشف endpoint و شکل‌دهی ترافیک.",
    },
    accent: "#34d399",
    accentSoft: "rgba(52, 211, 153, 0.14)",
    order: 4,
  },
  {
    id: "storage",
    name: { en: "Storage", fa: "ذخیره‌سازی" },
    shortName: { en: "Storage", fa: "ذخیره" },
    description: {
      en: "Persist state for apps and control planes.",
      fa: "پایداری وضعیت برای اپ و control plane.",
    },
    accent: "#fb923c",
    accentSoft: "rgba(251, 146, 60, 0.14)",
    order: 5,
  },
  {
    id: "delivery",
    name: {
      en: "App Definition & Delivery",
      fa: "تعریف و تحویل اپ",
    },
    shortName: { en: "Delivery", fa: "تحویل" },
    description: {
      en: "Package, ship, and continuously deliver apps (GitOps).",
      fa: "بسته‌بندی، ارسال و تحویل پیوسته اپ (GitOps).",
    },
    accent: "#f472b6",
    accentSoft: "rgba(244, 114, 182, 0.14)",
    order: 6,
  },
  {
    id: "observability",
    name: { en: "Observability", fa: "مشاهده‌پذیری" },
    shortName: { en: "Observability", fa: "مشاهده" },
    description: {
      en: "Metrics, traces, and logs for running systems.",
      fa: "متریک، تریس و لاگ برای سامانه‌های در حال اجرا.",
    },
    accent: "#a3e635",
    accentSoft: "rgba(163, 230, 53, 0.14)",
    order: 7,
  },
  {
    id: "security",
    name: { en: "Security & Policy", fa: "امنیت و سیاست" },
    shortName: { en: "Security", fa: "امنیت" },
    description: {
      en: "Runtime defense, policy, identity, and certificates.",
      fa: "دفاع runtime، سیاست، هویت و گواهی.",
    },
    accent: "#f87171",
    accentSoft: "rgba(248, 113, 113, 0.14)",
    order: 8,
  },
];

export const layersBottomToTop = [...layers].sort((a, b) => a.order - b.order);
export const layersTopToBottom = [...layersBottomToTop].reverse();

export function getLayer(id: string): LayerMeta | undefined {
  return layers.find((l) => l.id === id);
}
