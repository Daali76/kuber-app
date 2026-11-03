import type { DiagramComponent, DiagramConnection } from "@/lib/types";

/** Extra diagram pieces for DNS flows (merged with clusterBase). */
export const corednsDiagramExtra: {
  components: DiagramComponent[];
  connections: DiagramConnection[];
} = {
  components: [
    {
      id: "coredns",
      label: "CoreDNS",
      zone: "namespace",
      slot: "coredns",
      objectType: "Deployment",
      description: "Deployment in kube-system providing cluster DNS.",
      whyThere: "Cluster DNS watches the API for Services and Pods.",
      highlight: false,
    },
    {
      id: "coredns-svc",
      label: "kube-dns Service",
      zone: "namespace",
      slot: "coredns-svc",
      objectType: "Service",
      description: "ClusterIP Service fronting CoreDNS pods.",
      whyThere: "kubelet injects this ClusterIP into Pod DNS config.",
      highlight: false,
    },
  ],
  connections: [
    {
      id: "coredns-api",
      from: "coredns",
      to: "apiserver",
      label: "watch Endpoints / Services",
      highlight: false,
    },
    {
      id: "pod-coredns",
      from: "app-pod",
      to: "coredns-svc",
      label: "DNS :53",
      highlight: false,
    },
    {
      id: "coredns-svc-pods",
      from: "coredns-svc",
      to: "coredns",
      label: "ClusterIP → pods",
      highlight: false,
    },
  ],
};

export function lessonNeedsCorednsDiagram(lessonId: string): boolean {
  return lessonId === "service-dns";
}
