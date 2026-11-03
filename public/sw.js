/* Cloud Native Atlas — offline service worker (static export). */
const CACHE_NAME = "cna-learn-v3";

const PRECACHE_ROUTES = [
  "/",
  "/roadmap",
  "/builder",
  "/search",
  "/learn",
  "/strategies",
  "/strategies/rolling-update",
  "/strategies/recreate",
  "/strategies/canary-argo-rollouts",
  "/strategies/blue-green-argo-rollouts",
  "/strategies/compare-strategies",
  "/strategies/argocd-application",
  "/strategies/app-of-apps",
  "/strategies/applicationset",
  "/strategies/kustomize-argocd",
  "/strategies/helm-vs-kustomize",
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

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        PRECACHE_ROUTES.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res.ok) await cache.put(url, res.clone());
          } catch {
            /* ignore */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok && request.method === "GET") {
    cache.put(request, res.clone());
  }
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const network = fetch(request)
    .then((res) => {
      if (res.ok && request.method === "GET") {
        cache.put(request, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

function isStaleWhileRevalidatePath(pathname) {
  return (
    pathname.startsWith("/catalog/") ||
    pathname === "/catalog" ||
    pathname.startsWith("/logos/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStaleWhileRevalidatePath(url.pathname)) {
    event.respondWith(
      staleWhileRevalidate(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match(url.pathname)) ||
          (await cache.match("/")) ||
          Response.error()
        );
      }),
    );
    return;
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2");

  if (
    isStatic ||
    request.mode === "navigate" ||
    PRECACHE_ROUTES.includes(url.pathname)
  ) {
    event.respondWith(
      cacheFirst(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match(url.pathname)) ||
          (await cache.match("/")) ||
          Response.error()
        );
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "WARM_URLS" && Array.isArray(event.data.urls)) {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        for (const url of event.data.urls) {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (!res.ok) continue;
            await cache.put(url, res.clone());
            if (res.headers.get("content-type")?.includes("text/html")) {
              const text = await res.clone().text();
              const assets = [
                ...text.matchAll(/\/_next\/static\/[^"'\\\s>]+/g),
              ].map((m) => m[0]);
              await Promise.all(
                [...new Set(assets)].map(async (asset) => {
                  try {
                    const aRes = await fetch(asset);
                    if (aRes.ok) await cache.put(asset, aRes.clone());
                  } catch {
                    /* ignore */
                  }
                }),
              );
            }
          } catch {
            /* ignore */
          }
        }
      })(),
    );
  }
});
