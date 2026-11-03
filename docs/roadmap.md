# Content roadmap — CNCF deep guides

Phase 3 adds the offline [CNCF Landscape catalog](/catalog). Deep interactive guides live under `/tools/[id]`. This doc tracks **Graduated** CNCF projects from the imported catalog that still need a deep guide.

Regenerate the catalog with `npm run import:landscape` before updating this list.

## Deep guides shipped (15)

These app tools already have full `/tools/[id]` workspaces (diagram, implement, lab, quiz):

| Catalog id | Name | Landscape maturity |
| --- | --- | --- |
| `kubernetes` | Kubernetes | Graduated |
| `containerd` | containerd | Graduated |
| `coredns` | CoreDNS | Graduated |
| `cilium` | Cilium | Graduated |
| `istio` | Istio | Graduated |
| `prometheus` | Prometheus | Graduated |
| `grafana` | Grafana | *(vendor — no CNCF project badge in Landscape)* |
| `opentelemetry` | OpenTelemetry | Graduated |
| `fluent-bit` | Fluent Bit | *(not listed separately in Landscape; Fluentd is Graduated)* |
| `argo-cd` | Argo | Graduated |
| `helm` | Helm | Graduated |
| `cert-manager` | cert-manager | Graduated |
| `falco` | Falco | Graduated |
| `kyverno` | Kyverno | Graduated |
| `rook` | Rook | Graduated |

## Next — Graduated CNCF projects without deep guides

Prioritize widely deployed control-plane and platform tools:

1. **Buildpacks** (`buildpacks`)
2. **CloudEvents** (`cloudevents`)
3. **CRI-O** (`cri-o`)
4. **Crossplane** (`crossplane`)
5. **CubeFS** (`chubaofs`)
6. **Dapr** (`dapr`)
7. **Dragonfly** (`d7y`)
8. **Envoy** (`envoy`)
9. **etcd** (`etcd`)
10. **Fluentd** (`fluentd`)
11. **Flux** (`fluxcd`)
12. **Harbor** (`harbor`)
13. **in-toto** (`intoto`)
14. **Jaeger** (`jaeger`)
15. **Karmada** (`karmada`)
16. **KEDA** (`KEDA`)
17. **Knative** (`knative`)
18. **KubeEdge** (`kubeedge`)
19. **Kubeflow** (`kubeflow`)
20. **Linkerd** (`linkerd`)
21. **NATS** (`nats`)
22. **Open Policy Agent (OPA)** (`openpolicyagent`)
23. **SPIFFE** (`spiffe`)
24. **SPIRE** (`spire`)
25. **The Update Framework (TUF)** (`tuf`)
26. **TiKV** (`tikv`)
27. **Vitess** (`vitess`)

## Later — Incubating & Sandbox

After Graduated coverage, extend guides to Incubating then Sandbox entries flagged in `/catalog` filters. Use catalog maturity dates and upstream annual reviews to pick order.
