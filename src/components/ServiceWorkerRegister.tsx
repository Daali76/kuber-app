"use client";

import { useEffect } from "react";

const WARM_ROUTES = [
  "/",
  "/roadmap",
  "/builder",
  "/search",
  "/learn",
  "/learn/container-image",
  "/learn/pod",
  "/learn/node-kubelet",
  "/learn/control-plane",
  "/learn/deployment-replicaset",
  "/learn/service-dns",
  "/learn/namespace",
  "/learn/configmap-secret",
  "/learn/daemonset",
  "/learn/statefulset",
  "/learn/ingress",
  "/learn/crd-operator",
  "/learn/admission-webhook",
  "/learn/sidecar",
  "/glossary",
  "/compare",
  "/review",
  "/tools/kubernetes",
  "/tools/containerd",
  "/tools/coredns",
  "/tools/cilium",
  "/tools/istio",
  "/tools/prometheus",
  "/tools/grafana",
  "/tools/opentelemetry",
  "/tools/fluent-bit",
  "/tools/argo-cd",
  "/tools/helm",
  "/tools/cert-manager",
  "/tools/falco",
  "/tools/kyverno",
  "/tools/rook",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
];

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        if (cancelled) return;

        const worker = reg.active || navigator.serviceWorker.controller;
        if (worker) {
          worker.postMessage({ type: "WARM_URLS", urls: WARM_ROUTES });
        }
      } catch {
        /* non-fatal */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
