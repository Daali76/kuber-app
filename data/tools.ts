import type { Tool } from "@/lib/types";

export const tools: Tool[] = [
  {
    id: "terraform",
    name: "Terraform",
    layer: "infrastructure",
    maturity: "External",
    summary: "Declarative infrastructure-as-code for cloud and on-prem resources.",
    problem: "Manual provisioning drifts and does not scale across environments.",
    levels: {
      beginner:
        "You write .tf files that describe networks, VMs, and managed services. terraform apply creates or updates them.",
      intermediate:
        "Modules, workspaces, and remote state let teams share reusable stacks with locked state backends.",
      advanced:
        "Policy as code, provider development, and carefully planned state migrations keep large fleets consistent.",
    },
    useWhen: [
      "You need multi-cloud or multi-account resource provisioning",
      "Desired state of infrastructure should live in version control",
    ],
    avoidWhen: [
      "You only need in-cluster Kubernetes resources (prefer Helm/GitOps)",
      "Your platform already standardizes on a single cloud's native IaC",
    ],
    alternatives: [
      { id: "crossplane", comparison: "Crossplane manages infra via Kubernetes APIs instead of a separate CLI/state file." },
    ],
    connectsTo: { upstream: [], downstream: ["kubernetes", "crossplane"] },
    example: {
      language: "hcl",
      title: "Minimal AWS VPC sketch",
      code: `resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "atlas-vpc" }
}`,
    },
    docsUrl: "https://developer.hashicorp.com/terraform/docs",
    repoUrl: "https://github.com/hashicorp/terraform",
  },
  {
    id: "crossplane",
    name: "Crossplane",
    layer: "infrastructure",
    maturity: "Incubating",
    summary: "Kubernetes-native control plane for provisioning cloud infrastructure.",
    problem: "Teams want cloud resources managed with the same APIs and GitOps flow as apps.",
    levels: {
      beginner:
        "Install Crossplane, add a provider, and create managed resources as Kubernetes custom resources.",
      intermediate:
        "Composition and XRDs let you offer opinionated platform APIs to application teams.",
      advanced:
        "Functions, package registries, and multi-cluster control planes model full internal platforms.",
    },
    useWhen: [
      "Your platform is already Kubernetes-centric",
      "You want GitOps for both apps and cloud resources",
    ],
    avoidWhen: [
      "Operators are unfamiliar with Kubernetes CRDs",
      "You need mature multi-cloud modules without building compositions",
    ],
    alternatives: [
      { id: "terraform", comparison: "Terraform is CLI/state-centric; Crossplane is API/Kubernetes-centric." },
    ],
    connectsTo: { upstream: ["kubernetes", "terraform"], downstream: ["helm", "argo-cd", "flux"] },
    example: {
      language: "yaml",
      title: "ProviderConfig sketch",
      code: `apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws-s3
spec:
  package: xpkg.upbound.io/upbound/provider-aws-s3:v1.16.0`,
    },
    docsUrl: "https://docs.crossplane.io/",
    repoUrl: "https://github.com/crossplane/crossplane",
  },
  {
    id: "containerd",
    name: "containerd",
    layer: "runtime",
    maturity: "Graduated",
    summary: "Industry-standard container runtime with an emphasis on simplicity and robustness.",
    problem: "Kubernetes nodes need a CRI runtime to pull images and run containers.",
    levels: {
      beginner:
        "containerd runs containers on a host; kubelet talks to it through the CRI plugin.",
      intermediate:
        "ctr/nerdctl, snapshotters, and registries configure image pulls and storage drivers.",
      advanced:
        "Shim APIs, sandbox runtimes, and custom snapshotters support specialized workloads.",
    },
    useWhen: [
      "You want the default runtime used by most Kubernetes distributions",
      "You need a focused runtime without a full Docker Engine",
    ],
    avoidWhen: [
      "You specifically require CRI-O's Kubernetes-focused design in your distro",
    ],
    alternatives: [
      { id: "cri-o", comparison: "CRI-O is purpose-built for Kubernetes; containerd is also used outside Kubernetes." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["cilium", "falco"] },
    example: {
      language: "bash",
      title: "Pull and run with nerdctl",
      code: `nerdctl pull nginx:alpine
nerdctl run --rm -p 8080:80 nginx:alpine`,
    },
    docsUrl: "https://containerd.io/docs/",
    repoUrl: "https://github.com/containerd/containerd",
  },
  {
    id: "cri-o",
    name: "CRI-O",
    layer: "runtime",
    maturity: "Incubating",
    summary: "Lightweight OCI-compatible runtime purpose-built for Kubernetes.",
    problem: "Some clusters want a Kubernetes-only runtime without Docker Engine baggage.",
    levels: {
      beginner:
        "CRI-O implements the Kubernetes CRI so kubelet can manage pods.",
      intermediate:
        "Configure registries, storage, and cgroup drivers to match your node OS.",
      advanced:
        "RuntimeClasses and alternate OCI runtimes (e.g. Kata) plug into CRI-O.",
    },
    useWhen: [
      "Your distribution standardizes on CRI-O (OpenShift, some kubeadm setups)",
      "You want a Kubernetes-scoped runtime",
    ],
    avoidWhen: [
      "You need a general-purpose runtime for non-Kubernetes workloads on the same host",
    ],
    alternatives: [
      { id: "containerd", comparison: "containerd is broader; CRI-O stays tightly scoped to Kubernetes." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["cilium", "falco"] },
    example: {
      language: "bash",
      title: "Check CRI endpoint",
      code: `crictl --runtime-endpoint unix:///var/run/crio/crio.sock info`,
    },
    docsUrl: "https://cri-o.io/",
    repoUrl: "https://github.com/cri-o/cri-o",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    layer: "orchestration",
    maturity: "Graduated",
    summary: "Portable platform for automating deployment, scaling, and operations of containers.",
    problem: "Running many containers across machines needs scheduling, healing, and APIs.",
    levels: {
      beginner:
        "You declare Pods and Deployments; the control plane places them on nodes and restarts failures.",
      intermediate:
        "Services, Ingress/Gateway, ConfigMaps, Secrets, and RBAC shape real application platforms.",
      advanced:
        "Operators, scheduling plugins, and multi-cluster topologies extend the API for platforms.",
    },
    useWhen: [
      "You run many containerized services that need orchestration",
      "You want a portable API across clouds and on-prem",
    ],
    avoidWhen: [
      "A single VM or managed serverless covers your workload",
      "Operational overhead outweighs benefits for a tiny team",
    ],
    alternatives: [],
    connectsTo: {
      upstream: ["containerd", "cri-o", "etcd"],
      downstream: ["helm", "cilium", "prometheus", "argo-cd"],
    },
    example: {
      language: "yaml",
      title: "Deployment",
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80`,
    },
    docsUrl: "https://kubernetes.io/docs/home/",
    repoUrl: "https://github.com/kubernetes/kubernetes",
  },
  {
    id: "keda",
    name: "KEDA",
    layer: "orchestration",
    maturity: "Graduated",
    summary: "Event-driven autoscaling for Kubernetes workloads.",
    problem: "CPU/memory HPA alone cannot scale on queue depth, lag, or external events.",
    levels: {
      beginner:
        "Install KEDA and create a ScaledObject that watches a scaler (e.g. Kafka, Prometheus).",
      intermediate:
        "Combine scaled jobs, authentication refs, and fallbacks for production event sources.",
      advanced:
        "Custom scalers and pause/activation thresholds tune bursty workloads carefully.",
    },
    useWhen: [
      "Workloads should scale on events or external metrics",
      "You want scale-to-zero for idle consumers",
    ],
    avoidWhen: [
      "Simple CPU/memory HPA is enough",
      "Your platform forbids extra operators",
    ],
    alternatives: [
      { id: "kubernetes", comparison: "Built-in HPA covers resource metrics; KEDA adds event sources." },
    ],
    connectsTo: { upstream: ["kubernetes", "prometheus"], downstream: ["helm"] },
    example: {
      language: "yaml",
      title: "ScaledObject (Prometheus)",
      code: `apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: worker
spec:
  scaleTargetRef:
    name: worker
  minReplicaCount: 0
  maxReplicaCount: 20
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: queue_depth
        query: sum(queue_depth)
        threshold: "10"`,
    },
    docsUrl: "https://keda.sh/docs/",
    repoUrl: "https://github.com/kedacore/keda",
  },
  {
    id: "knative",
    name: "Knative",
    layer: "orchestration",
    maturity: "Graduated",
    summary: "Kubernetes-based platform for serverless-style workloads and eventing.",
    problem: "Teams want request-driven scale-to-zero and event wiring on Kubernetes.",
    levels: {
      beginner:
        "Knative Serving deploys a Service that scales with HTTP traffic, including to zero.",
      intermediate:
        "Revisions, traffic splitting, and Eventing brokers connect producers and consumers.",
      advanced:
        "Custom autoscalers, networking plugins, and multi-tenant event meshes.",
    },
    useWhen: [
      "You need scale-to-zero HTTP services on Kubernetes",
      "You want portable serverless APIs without leaving the cluster",
    ],
    avoidWhen: [
      "Long-running always-on services with no scale-to-zero need",
      "Managed cloud functions already fit and reduce ops",
    ],
    alternatives: [
      { id: "keda", comparison: "KEDA scales existing workloads; Knative adds a Serving/Eventing programming model." },
    ],
    connectsTo: { upstream: ["kubernetes", "istio", "contour"], downstream: ["opentelemetry"] },
    example: {
      language: "yaml",
      title: "Knative Service",
      code: `apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: hello
spec:
  template:
    spec:
      containers:
        - image: ghcr.io/knative/helloworld-go:latest
          env:
            - name: TARGET
              value: Atlas`,
    },
    docsUrl: "https://knative.dev/docs/",
    repoUrl: "https://github.com/knative/serving",
  },
  {
    id: "cilium",
    name: "Cilium",
    layer: "networking",
    maturity: "Graduated",
    summary: "eBPF-powered networking, security, and observability for Kubernetes.",
    problem: "kube-proxy and basic CNIs struggle with scale, identity-aware policy, and visibility.",
    levels: {
      beginner:
        "Install Cilium as the cluster CNI to provide pod networking and NetworkPolicies.",
      intermediate:
        "Hubble observes flows; CiliumNetworkPolicy uses identity instead of only IPs.",
      advanced:
        "Cluster mesh, Gateway API, service mesh mode, and advanced eBPF datapath tuning.",
    },
    useWhen: [
      "You want modern eBPF networking and rich network policy",
      "You need built-in flow observability (Hubble)",
    ],
    avoidWhen: [
      "Your environment cannot run eBPF on the node kernel",
      "A simpler CNI already meets scale and policy needs",
    ],
    alternatives: [
      { id: "istio", comparison: "Istio focuses on L7 mesh features; Cilium centers on eBPF networking/security." },
      { id: "linkerd", comparison: "Linkerd is a lightweight mesh; Cilium can optionally provide mesh features too." },
    ],
    connectsTo: { upstream: ["kubernetes", "containerd"], downstream: ["prometheus", "envoy"] },
    example: {
      language: "yaml",
      title: "CiliumNetworkPolicy",
      code: `apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: allow-frontend
spec:
  endpointSelector:
    matchLabels: { app: api }
  ingress:
    - fromEndpoints:
        - matchLabels: { app: frontend }
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP`,
    },
    docsUrl: "https://docs.cilium.io/",
    repoUrl: "https://github.com/cilium/cilium",
  },
  {
    id: "coredns",
    name: "CoreDNS",
    layer: "networking",
    maturity: "Graduated",
    summary: "Flexible DNS server and the default cluster DNS for Kubernetes.",
    problem: "Pods need stable service discovery names inside the cluster.",
    levels: {
      beginner:
        "CoreDNS answers cluster.local queries so Services are reachable by name.",
      intermediate:
        "Corefile plugins rewrite, forward, cache, and integrate with Kubernetes API.",
      advanced:
        "Custom plugins and multi-cluster DNS designs extend discovery beyond one cluster.",
    },
    useWhen: [
      "Running Kubernetes (it is the default DNS)",
      "You need a pluggable DNS server",
    ],
    avoidWhen: [
      "You are not running a system that needs cluster DNS",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes", "etcd"], downstream: ["envoy", "istio"] },
    example: {
      language: "bash",
      title: "Query cluster DNS",
      code: `kubectl -n kube-system get configmap coredns -o yaml
kubectl run -it --rm debug --image=busybox:1.36 --restart=Never -- nslookup kubernetes.default`,
    },
    docsUrl: "https://coredns.io/manual/toc/",
    repoUrl: "https://github.com/coredns/coredns",
  },
  {
    id: "envoy",
    name: "Envoy",
    layer: "networking",
    maturity: "Graduated",
    summary: "High-performance L7/L4 proxy designed for cloud-native service communication.",
    problem: "Apps need retries, timeouts, TLS, and observability without baking them into every service.",
    levels: {
      beginner:
        "Envoy terminates or proxies HTTP/gRPC with discovery from a control plane.",
      intermediate:
        "Listeners, clusters, routes, and filters implement advanced traffic policies.",
      advanced:
        "xDS APIs, WASM filters, and custom extensions power meshes and API gateways.",
    },
    useWhen: [
      "Building gateways or service meshes",
      "You need battle-tested L7 proxy features",
    ],
    avoidWhen: [
      "A simple ingress controller covers your needs",
      "You do not want to operate proxy sidecars or gateways",
    ],
    alternatives: [
      { id: "cilium", comparison: "Cilium uses eBPF at L3/L4 and can integrate Envoy for L7." },
    ],
    connectsTo: { upstream: ["istio", "contour"], downstream: ["opentelemetry", "prometheus"] },
    example: {
      language: "yaml",
      title: "Static listener sketch",
      code: `static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address: { address: 0.0.0.0, port_value: 8080 }
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/" }
                          route: { cluster: service }
                http_filters:
                  - name: envoy.filters.http.router`,
    },
    docsUrl: "https://www.envoyproxy.io/docs/envoy/latest/",
    repoUrl: "https://github.com/envoyproxy/envoy",
  },
  {
    id: "istio",
    name: "Istio",
    layer: "networking",
    maturity: "Graduated",
    summary: "Feature-rich service mesh for traffic management, security, and telemetry.",
    problem: "Microservices need mTLS, routing, and consistent telemetry across languages.",
    levels: {
      beginner:
        "Install Istio, label a namespace for injection, and get sidecars with mTLS and metrics.",
      intermediate:
        "VirtualService, DestinationRule, and PeerAuthentication shape canaries and policy.",
      advanced:
        "Ambient mode, multi-cluster mesh, and custom Wasm plugins for large platforms.",
    },
    useWhen: [
      "You need advanced L7 traffic management and mesh-wide mTLS",
      "You want deep integrations with Envoy features",
    ],
    avoidWhen: [
      "Mesh complexity is too high for team size",
      "A lighter mesh (Linkerd) or CNI policy is enough",
    ],
    alternatives: [
      { id: "linkerd", comparison: "Linkerd prioritizes simplicity and operational lightness." },
      { id: "cilium", comparison: "Cilium can provide mesh features with an eBPF-first approach." },
    ],
    connectsTo: { upstream: ["kubernetes", "envoy"], downstream: ["prometheus", "jaeger", "opentelemetry"] },
    example: {
      language: "yaml",
      title: "VirtualService canary",
      code: `apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts: [reviews]
  http:
    - route:
        - destination:
            host: reviews
            subset: v1
          weight: 90
        - destination:
            host: reviews
            subset: v2
          weight: 10`,
    },
    docsUrl: "https://istio.io/latest/docs/",
    repoUrl: "https://github.com/istio/istio",
  },
  {
    id: "linkerd",
    name: "Linkerd",
    layer: "networking",
    maturity: "Graduated",
    summary: "Ultralight service mesh focused on security, reliability, and simplicity.",
    problem: "Teams want mTLS and golden metrics without a heavy mesh control plane.",
    levels: {
      beginner:
        "Install Linkerd and mesh a workload to get mTLS and success-rate metrics.",
      intermediate:
        "TrafficSplit, retries, and timeouts improve resilience between services.",
      advanced:
        "Multi-cluster mirrors and policy CRDs extend zero-trust across clusters.",
    },
    useWhen: [
      "You want a simple, production-proven mesh",
      "Operational overhead must stay low",
    ],
    avoidWhen: [
      "You need Istio's broader Envoy feature surface",
      "You only need NetworkPolicy, not a mesh",
    ],
    alternatives: [
      { id: "istio", comparison: "Istio is more feature-heavy; Linkerd aims for minimal ops." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus", "opentelemetry"] },
    example: {
      language: "bash",
      title: "Inject and check",
      code: `linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -
kubectl get -n linkerd deploy`,
    },
    docsUrl: "https://linkerd.io/2/overview/",
    repoUrl: "https://github.com/linkerd/linkerd2",
  },
  {
    id: "contour",
    name: "Contour",
    layer: "networking",
    maturity: "Graduated",
    summary: "Kubernetes ingress controller powered by Envoy.",
    problem: "Clusters need HTTP ingress with a clean Kubernetes-native API.",
    levels: {
      beginner:
        "Deploy Contour and create HTTPProxy or Ingress objects to expose services.",
      intermediate:
        "TLS secrets, retries, and timeout policies configure production edge traffic.",
      advanced:
        "Gateway API support and multi-team delegation with Contour's design.",
    },
    useWhen: [
      "You want Envoy-based ingress on Kubernetes",
      "HTTPProxy's design fits multi-team ingress",
    ],
    avoidWhen: [
      "A cloud load balancer + Gateway API implementation already covers you",
    ],
    alternatives: [
      { id: "istio", comparison: "Istio Gateway can also front mesh traffic; Contour focuses on ingress." },
      { id: "envoy", comparison: "Envoy is the data plane Contour configures for you." },
    ],
    connectsTo: { upstream: ["kubernetes", "envoy"], downstream: ["cert-manager"] },
    example: {
      language: "yaml",
      title: "HTTPProxy",
      code: `apiVersion: projectcontour.io/v1
kind: HTTPProxy
metadata:
  name: www
spec:
  virtualhost:
    fqdn: www.example.com
  routes:
    - conditions:
        - prefix: /
      services:
        - name: web
          port: 80`,
    },
    docsUrl: "https://projectcontour.io/docs/",
    repoUrl: "https://github.com/projectcontour/contour",
  },
  {
    id: "nats",
    name: "NATS",
    layer: "networking",
    maturity: "Graduated",
    summary: "Connective technology for modern distributed systems (messaging).",
    problem: "Services need a simple, high-performance messaging and streaming layer.",
    levels: {
      beginner:
        "Publish/subscribe subjects connect producers and consumers with minimal config.",
      intermediate:
        "JetStream adds persistence, acknowledgements, and consumer groups.",
      advanced:
        "Superclusters, leaf nodes, and multi-tenancy build global messaging fabrics.",
    },
    useWhen: [
      "You need lightweight pub/sub or streaming between services",
      "Latency and operational simplicity matter",
    ],
    avoidWhen: [
      "You require a specific ecosystem already standardized on Kafka-only tooling",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes"], downstream: ["opentelemetry", "prometheus"] },
    example: {
      language: "bash",
      title: "Pub/sub with nats CLI",
      code: `nats pub atlas.hello "hi from atlas"
nats sub atlas.hello`,
    },
    docsUrl: "https://docs.nats.io/",
    repoUrl: "https://github.com/nats-io/nats-server",
  },
  {
    id: "rook",
    name: "Rook",
    layer: "storage",
    maturity: "Graduated",
    summary: "Cloud-native storage orchestrator — commonly Ceph on Kubernetes.",
    problem: "Stateful apps need automated, resilient block/file/object storage in-cluster.",
    levels: {
      beginner:
        "Rook operators install and manage Ceph so you can request PersistentVolumes.",
      intermediate:
        "StorageClasses for RBD, CephFS, and RGW serve different workload types.",
      advanced:
        "Device management, stretch clusters, and upgrade strategies for large fleets.",
    },
    useWhen: [
      "You need self-managed software-defined storage on Kubernetes",
      "Block, file, and object from one Ceph cluster",
    ],
    avoidWhen: [
      "Managed cloud disks/filestores are simpler and sufficient",
      "Team cannot operate Ceph",
    ],
    alternatives: [
      { id: "longhorn", comparison: "Longhorn is lighter distributed block storage; Rook/Ceph is broader and heavier." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus"] },
    example: {
      language: "yaml",
      title: "PVC using Rook StorageClass",
      code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: rook-ceph-block
  resources:
    requests:
      storage: 10Gi`,
    },
    docsUrl: "https://rook.io/docs/rook/latest/",
    repoUrl: "https://github.com/rook/rook",
  },
  {
    id: "etcd",
    name: "etcd",
    layer: "storage",
    maturity: "Graduated",
    summary: "Distributed reliable key-value store — the Kubernetes control-plane backbone.",
    problem: "Distributed systems need strongly consistent configuration storage.",
    levels: {
      beginner:
        "Kubernetes stores cluster state in etcd; treat it as critical data.",
      intermediate:
        "Backups, compaction, and TLS are mandatory operational practices.",
      advanced:
        "Learner members, performance tuning, and disaster recovery drills.",
    },
    useWhen: [
      "Running Kubernetes or needing consistent KV consensus",
      "Coordinating distributed configuration",
    ],
    avoidWhen: [
      "You need a general application database (use a purpose-built DB)",
    ],
    alternatives: [
      { id: "tikv", comparison: "TiKV is a transactional KV store for apps; etcd is optimized for metadata/consensus." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["coredns"] },
    example: {
      language: "bash",
      title: "Snapshot backup",
      code: `ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\
  --cert=/etc/kubernetes/pki/etcd/server.crt \\
  --key=/etc/kubernetes/pki/etcd/server.key \\
  snapshot save /var/backups/etcd-snapshot.db`,
    },
    docsUrl: "https://etcd.io/docs/",
    repoUrl: "https://github.com/etcd-io/etcd",
  },
  {
    id: "longhorn",
    name: "Longhorn",
    layer: "storage",
    maturity: "Incubating",
    summary: "Cloud-native distributed block storage for Kubernetes.",
    problem: "Teams need simpler replicated volumes without full Ceph complexity.",
    levels: {
      beginner:
        "Install Longhorn and create volumes via StorageClass for stateful apps.",
      intermediate:
        "Snapshots, backups to S3, and replica placement improve durability.",
      advanced:
        "Recurring jobs, orphaned replica cleanup, and performance tuning.",
    },
    useWhen: [
      "You want relatively simple distributed block storage",
      "Small/medium clusters needing in-cluster replication",
    ],
    avoidWhen: [
      "You need Ceph-scale object/file features",
      "Cloud provider volumes are enough",
    ],
    alternatives: [
      { id: "rook", comparison: "Rook/Ceph is more powerful and operationally heavier than Longhorn." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus"] },
    example: {
      language: "yaml",
      title: "StorageClass",
      code: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn
provisioner: driver.longhorn.io
allowVolumeExpansion: true
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "30"`,
    },
    docsUrl: "https://longhorn.io/docs/",
    repoUrl: "https://github.com/longhorn/longhorn",
  },
  {
    id: "vitess",
    name: "Vitess",
    layer: "storage",
    maturity: "Graduated",
    summary: "Database clustering system for horizontal scaling of MySQL.",
    problem: "Single MySQL instances hit scalability and availability limits.",
    levels: {
      beginner:
        "Vitess shards MySQL and presents a unified query path to applications.",
      intermediate:
        "VSchema, vtgate, and managed failovers support multi-shard apps.",
      advanced:
        "Resharding workflows and multi-cell topologies for global scale.",
    },
    useWhen: [
      "You need to scale MySQL beyond a single primary",
      "You want Kubernetes-friendly MySQL sharding",
    ],
    avoidWhen: [
      "A managed relational service meets scale needs",
      "Your data model cannot tolerate sharding constraints",
    ],
    alternatives: [
      { id: "tikv", comparison: "TiKV is KV/transactional Rust storage; Vitess scales MySQL specifically." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus", "opentelemetry"] },
    example: {
      language: "bash",
      title: "Apply VSchema (illustrative)",
      code: `vtctldclient ApplySchema --sql="CREATE TABLE users (id BIGINT, name VARBINARY(128), PRIMARY KEY(id));" commerce
vtctldclient ApplyVSchema --vschema='{"tables":{"users":{}}}' commerce`,
    },
    docsUrl: "https://vitess.io/docs/",
    repoUrl: "https://github.com/vitessio/vitess",
  },
  {
    id: "tikv",
    name: "TiKV",
    layer: "storage",
    maturity: "Graduated",
    summary: "Distributed transactional key-value database built in Rust.",
    problem: "Applications need a scalable, ACID key-value store.",
    levels: {
      beginner:
        "TiKV stores key-value pairs across a Raft-replicated cluster.",
      intermediate:
        "Transactions, TTLs, and placement rules shape application data layouts.",
      advanced:
        "Coprocessors and multi-region deployments tune latency and consistency.",
    },
    useWhen: [
      "You need a transactional distributed KV store",
      "You are building on the TiDB ecosystem or similar",
    ],
    avoidWhen: [
      "etcd-style metadata store is all you need",
      "A managed database is simpler for your team",
    ],
    alternatives: [
      { id: "etcd", comparison: "etcd is for cluster metadata; TiKV is for application data at scale." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus", "opentelemetry"] },
    example: {
      language: "bash",
      title: "tikv-ctl status",
      code: `tikv-ctl --host 127.0.0.1:2379 store`,
    },
    docsUrl: "https://tikv.org/docs/",
    repoUrl: "https://github.com/tikv/tikv",
  },
  {
    id: "helm",
    name: "Helm",
    layer: "delivery",
    maturity: "Graduated",
    summary: "The package manager for Kubernetes.",
    problem: "Raw YAML for complex apps is hard to version, share, and configure.",
    levels: {
      beginner:
        "helm install deploys a chart with values you can override.",
      intermediate:
        "Chart dependencies, hooks, and library charts structure real releases.",
      advanced:
        "OCI registries, provenance, and GitOps-friendly packaging workflows.",
    },
    useWhen: [
      "You distribute or install parameterized Kubernetes apps",
      "You need a common packaging format",
    ],
    avoidWhen: [
      "A single plain manifest is enough",
      "You prefer only Kustomize without charts",
    ],
    alternatives: [
      { id: "argo-cd", comparison: "Argo CD deploys from Git; Helm is often the packaging format it renders." },
      { id: "flux", comparison: "Flux can reconcile HelmReleases continuously from Git." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["argo-cd", "flux"] },
    example: {
      language: "bash",
      title: "Install a chart",
      code: `helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-nginx bitnami/nginx --set service.type=ClusterIP`,
    },
    docsUrl: "https://helm.sh/docs/",
    repoUrl: "https://github.com/helm/helm",
  },
  {
    id: "argo-cd",
    name: "Argo CD",
    layer: "delivery",
    maturity: "Graduated",
    summary: "Declarative, GitOps continuous delivery for Kubernetes.",
    problem: "Manual kubectl applies drift from what is reviewed in Git.",
    levels: {
      beginner:
        "Point Argo CD at a Git repo and sync an Application to a cluster.",
      intermediate:
        "AppProjects, ApplicationSets, and sync waves manage multi-app delivery.",
      advanced:
        "Multi-cluster, SSO, and progressive sync strategies for platforms.",
    },
    useWhen: [
      "Git should be the source of truth for cluster state",
      "You want a UI and strong Kubernetes GitOps UX",
    ],
    avoidWhen: [
      "Push-based CI deploy is mandated and GitOps reconcile is forbidden",
    ],
    alternatives: [
      { id: "flux", comparison: "Flux is CLI/controller-centric and deeply modular; Argo CD offers a polished UI." },
    ],
    connectsTo: { upstream: ["helm", "kubernetes"], downstream: ["prometheus"] },
    example: {
      language: "yaml",
      title: "Application",
      code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    path: guestbook
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`,
    },
    docsUrl: "https://argo-cd.readthedocs.io/",
    repoUrl: "https://github.com/argoproj/argo-cd",
  },
  {
    id: "flux",
    name: "Flux",
    layer: "delivery",
    maturity: "Graduated",
    summary: "GitOps toolkit and controllers that reconcile cluster state from Git.",
    problem: "Clusters drift unless desired state is continuously applied from Git.",
    levels: {
      beginner:
        "bootstrap Flux with a Git repository and let controllers reconcile manifests.",
      intermediate:
        "Kustomizations, HelmReleases, and image automation keep apps current.",
      advanced:
        "Multi-tenant tenancy models and OCI artifacts as sources of truth.",
    },
    useWhen: [
      "You prefer composable GitOps controllers",
      "Helm + Kustomize automation from Git/OCI",
    ],
    avoidWhen: [
      "You specifically need Argo CD's Application UI as the primary interface",
    ],
    alternatives: [
      { id: "argo-cd", comparison: "Argo CD emphasizes apps/UI; Flux emphasizes modular controllers." },
    ],
    connectsTo: { upstream: ["helm", "kubernetes"], downstream: ["prometheus"] },
    example: {
      language: "bash",
      title: "Bootstrap",
      code: `flux bootstrap github \\
  --owner=my-org \\
  --repository=fleet-infra \\
  --branch=main \\
  --path=clusters/prod \\
  --personal`,
    },
    docsUrl: "https://fluxcd.io/flux/",
    repoUrl: "https://github.com/fluxcd/flux2",
  },
  {
    id: "backstage",
    name: "Backstage",
    layer: "delivery",
    maturity: "Graduated",
    summary: "Open platform for building developer portals.",
    problem: "Tooling sprawl makes it hard for developers to find services and standards.",
    levels: {
      beginner:
        "Run Backstage and register software components in the catalog.",
      intermediate:
        "Software templates scaffold new services with your golden paths.",
      advanced:
        "Custom plugins integrate CI, docs, scorecards, and Kubernetes context.",
    },
    useWhen: [
      "You need an internal developer portal",
      "Service catalog and scaffolding matter",
    ],
    avoidWhen: [
      "A small team with few services does not need a portal yet",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes", "argo-cd"], downstream: ["prometheus"] },
    example: {
      language: "yaml",
      title: "Catalog entity",
      code: `apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: checkout
  description: Checkout service
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: commerce`,
    },
    docsUrl: "https://backstage.io/docs",
    repoUrl: "https://github.com/backstage/backstage",
  },
  {
    id: "buildpacks",
    name: "Cloud Native Buildpacks",
    layer: "delivery",
    maturity: "Incubating",
    summary: "Transform source code into OCI images without a Dockerfile.",
    problem: "Writing and securing Dockerfiles for every language stack is costly.",
    levels: {
      beginner:
        "pack build detects your app and produces an image using buildpacks.",
      intermediate:
        "Builders and stacks standardize base images across teams.",
      advanced:
        "Custom buildpacks and CI integration enforce organizational policies.",
    },
    useWhen: [
      "You want Dockerfile-less image builds",
      "Platform teams provide standard builders",
    ],
    avoidWhen: [
      "You need highly custom image layouts that builders do not support",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes"], downstream: ["harbor", "tekton"] },
    example: {
      language: "bash",
      title: "pack build",
      code: `pack build my-app \\
  --builder paketobuildpacks/builder-jammy-base \\
  --path ./app`,
    },
    docsUrl: "https://buildpacks.io/docs/",
    repoUrl: "https://github.com/buildpacks/pack",
  },
  {
    id: "tekton",
    name: "Tekton",
    layer: "delivery",
    maturity: "Graduated",
    summary: "Cloud-native CI/CD building blocks on Kubernetes.",
    problem: "Teams want portable pipeline primitives as Kubernetes CRDs.",
    levels: {
      beginner:
        "Tasks and Pipelines define steps that run as pods.",
      intermediate:
        "PipelineRuns, workspaces, and results compose real CI workflows.",
      advanced:
        "Custom platform layers and remote resolvers for shared enterprise tasks.",
    },
    useWhen: [
      "You want Kubernetes-native pipelines",
      "Portable CI building blocks across clusters",
    ],
    avoidWhen: [
      "A managed CI system already fits and you do not want pipeline operators",
    ],
    alternatives: [
      { id: "argo-cd", comparison: "Argo CD focuses on GitOps deploy; Tekton focuses on build/pipeline execution." },
    ],
    connectsTo: { upstream: ["kubernetes", "buildpacks"], downstream: ["harbor", "flux"] },
    example: {
      language: "yaml",
      title: "Task",
      code: `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: echo
spec:
  steps:
    - name: echo
      image: alpine:3.20
      script: |
        #!/bin/sh
        echo "hello from tekton"`,
    },
    docsUrl: "https://tekton.dev/docs/",
    repoUrl: "https://github.com/tektoncd/pipeline",
  },
  {
    id: "dapr",
    name: "Dapr",
    layer: "delivery",
    maturity: "Graduated",
    summary: "APIs for building portable and reliable microservices.",
    problem: "Distributed app concerns (state, pub/sub, secrets) get reimplemented per language.",
    levels: {
      beginner:
        "Sidecar or local process exposes HTTP/gRPC APIs for state and pub/sub.",
      intermediate:
        "Components swap Redis/Kafka/cloud services without changing app code.",
      advanced:
        "Actors, workflows, and multi-cluster resiliency patterns.",
    },
    useWhen: [
      "Polyglot microservices need common distributed primitives",
      "You want infrastructure swapping via components",
    ],
    avoidWhen: [
      "A single-language framework already provides these capabilities",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes", "nats"], downstream: ["opentelemetry", "prometheus"] },
    example: {
      language: "bash",
      title: "Save state via Dapr API",
      code: `curl -X POST http://localhost:3500/v1.0/state/statestore \\
  -H "Content-Type: application/json" \\
  -d '[{"key":"order","value":{"id":1}}]'`,
    },
    docsUrl: "https://docs.dapr.io/",
    repoUrl: "https://github.com/dapr/dapr",
  },
  {
    id: "prometheus",
    name: "Prometheus",
    layer: "observability",
    maturity: "Graduated",
    summary: "Metrics monitoring and alerting toolkit with a dimensional data model.",
    problem: "Dynamic cloud-native targets need pull-based metrics and alert rules.",
    levels: {
      beginner:
        "Prometheus scrapes /metrics endpoints and you graph time series.",
      intermediate:
        "Service discovery, recording rules, and Alertmanager route production alerts.",
      advanced:
        "Sharding, remote write, and federation for large multi-cluster estates.",
    },
    useWhen: [
      "You need Kubernetes-native metrics and alerting",
      "Exporters already expose Prometheus format",
    ],
    avoidWhen: [
      "You only need logs/traces and already have another metrics SaaS mandated",
    ],
    alternatives: [
      { id: "thanos", comparison: "Thanos extends Prometheus with long-term storage and global query." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["thanos", "opentelemetry"] },
    example: {
      language: "yaml",
      title: "ServiceMonitor sketch",
      code: `apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web
spec:
  selector:
    matchLabels: { app: web }
  endpoints:
    - port: http
      path: /metrics
      interval: 30s`,
    },
    docsUrl: "https://prometheus.io/docs/introduction/overview/",
    repoUrl: "https://github.com/prometheus/prometheus",
  },
  {
    id: "opentelemetry",
    name: "OpenTelemetry",
    layer: "observability",
    maturity: "Graduated",
    summary: "Vendor-neutral APIs, SDKs, and tools for traces, metrics, and logs.",
    problem: "Instrumenting apps separately for each vendor locks you in.",
    levels: {
      beginner:
        "Add OTel SDK instrumentation and export to a collector backend.",
      intermediate:
        "Collector pipelines process, sample, and route telemetry.",
      advanced:
        "Custom samplers, connectors, and multi-signal correlation strategies.",
    },
    useWhen: [
      "You want portable instrumentation across backends",
      "You need traces + metrics + logs with one ecosystem",
    ],
    avoidWhen: [
      "A single vendor agent is mandated with no portability requirement",
    ],
    alternatives: [
      { id: "jaeger", comparison: "Jaeger is a tracing backend; OpenTelemetry is how you produce portable telemetry." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["jaeger", "prometheus"] },
    example: {
      language: "yaml",
      title: "Collector receiver sketch",
      code: `receivers:
  otlp:
    protocols:
      grpc:
      http:
exporters:
  otlp:
    endpoint: jaeger:4317
    tls:
      insecure: true
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp]`,
    },
    docsUrl: "https://opentelemetry.io/docs/",
    repoUrl: "https://github.com/open-telemetry/opentelemetry-collector",
  },
  {
    id: "jaeger",
    name: "Jaeger",
    layer: "observability",
    maturity: "Graduated",
    summary: "Distributed tracing platform for monitoring microservice transactions.",
    problem: "Request latency across many services is hard to debug without traces.",
    levels: {
      beginner:
        "Services emit spans; Jaeger UI shows request timelines.",
      intermediate:
        "Sampling strategies and storage backends (e.g. Elasticsearch) for production.",
      advanced:
        "Adaptive sampling and multi-tenant deployments at scale.",
    },
    useWhen: [
      "You need an open-source tracing backend and UI",
      "Microservices request flows need debugging",
    ],
    avoidWhen: [
      "You already standardized on another OTLP-compatible tracing backend only",
    ],
    alternatives: [
      { id: "opentelemetry", comparison: "Use OTel to instrument; Jaeger to store/visualize traces." },
    ],
    connectsTo: { upstream: ["opentelemetry", "istio"], downstream: [] },
    example: {
      language: "bash",
      title: "All-in-one for local demo",
      code: `docker run --rm -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one:1.57`,
    },
    docsUrl: "https://www.jaegertracing.io/docs/",
    repoUrl: "https://github.com/jaegertracing/jaeger",
  },
  {
    id: "fluentd",
    name: "Fluentd",
    layer: "observability",
    maturity: "Graduated",
    summary: "Unified logging layer that collects, transforms, and routes logs.",
    problem: "Logs are scattered across nodes and formats without a common pipeline.",
    levels: {
      beginner:
        "Fluentd collects container/node logs and forwards them to a destination.",
      intermediate:
        "Filters parse, enrich, and buffer logs before routing.",
      advanced:
        "High-availability plugins and routing topologies for multi-cluster logging.",
    },
    useWhen: [
      "You need a flexible, plugin-rich log router",
      "Multiple outputs from one collection pipeline",
    ],
    avoidWhen: [
      "A simpler DaemonSet shipper already meets requirements",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes"], downstream: ["opentelemetry", "prometheus"] },
    example: {
      language: "yaml",
      title: "Forward snippet",
      code: `<source>
  @type forward
  port 24224
</source>
<match **>
  @type stdout
</match>`,
    },
    docsUrl: "https://docs.fluentd.org/",
    repoUrl: "https://github.com/fluent/fluentd",
  },
  {
    id: "thanos",
    name: "Thanos",
    layer: "observability",
    maturity: "Incubating",
    summary: "Highly available metric system with long-term storage on object stores.",
    problem: "Prometheus retention and single-replica limits hurt large fleets.",
    levels: {
      beginner:
        "Sidecar uploads blocks; Query reads global metrics across Prometheis.",
      intermediate:
        "Store Gateway, Compactor, and Ruler handle cheap long-term storage and rules.",
      advanced:
        "Receive for multi-tenant remote write and careful downsampling strategies.",
    },
    useWhen: [
      "You outgrow single Prometheus retention",
      "You need global query across many Prometheus servers",
    ],
    avoidWhen: [
      "One Prometheus with enough retention is fine",
    ],
    alternatives: [
      { id: "prometheus", comparison: "Prometheus is the core TSDB; Thanos adds HA and long-term storage." },
    ],
    connectsTo: { upstream: ["prometheus"], downstream: [] },
    example: {
      language: "bash",
      title: "Query component (illustrative)",
      code: `thanos query \\
  --http-address 0.0.0.0:9090 \\
  --endpoint dnssrv+_grpc._tcp.prometheus-sidecar.monitoring.svc`,
    },
    docsUrl: "https://thanos.io/tip/thanos/getting-started.md/",
    repoUrl: "https://github.com/thanos-io/thanos",
  },
  {
    id: "falco",
    name: "Falco",
    layer: "security",
    maturity: "Graduated",
    summary: "Cloud-native runtime security detection engine.",
    problem: "Misbehavior inside containers can go unnoticed without runtime signals.",
    levels: {
      beginner:
        "Falco watches syscalls and emits alerts for suspicious behaviors.",
      intermediate:
        "Custom rules and outputs integrate with your alerting stack.",
      advanced:
        "Plugins and modern eBPF instrumentation for richer detection.",
    },
    useWhen: [
      "You need runtime threat detection on Kubernetes nodes",
      "Compliance expects runtime monitoring",
    ],
    avoidWhen: [
      "You only need shift-left scanning without runtime detection",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes", "containerd"], downstream: ["prometheus", "fluentd"] },
    example: {
      language: "bash",
      title: "Run Falco rules check",
      code: `falco -r /etc/falco/falco_rules.yaml -M 1`,
    },
    docsUrl: "https://falco.org/docs/",
    repoUrl: "https://github.com/falcosecurity/falco",
  },
  {
    id: "opa",
    name: "OPA",
    layer: "security",
    maturity: "Graduated",
    summary: "General-purpose policy engine using Rego for decisions across stacks.",
    problem: "Authorization and validation rules get hard-coded into every service.",
    levels: {
      beginner:
        "Write Rego policies and query OPA for allow/deny decisions.",
      intermediate:
        "Gatekeeper uses OPA for Kubernetes admission constraints.",
      advanced:
        "Partial evaluation and distributed policy bundles at scale.",
    },
    useWhen: [
      "You need flexible policy beyond Kubernetes",
      "Admission control with Gatekeeper/OPA",
    ],
    avoidWhen: [
      "You only need Kubernetes policy and prefer Kyverno's YAML-native rules",
    ],
    alternatives: [
      { id: "kyverno", comparison: "Kyverno is Kubernetes-native YAML policy; OPA/Rego is general-purpose." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["argo-cd", "envoy"] },
    example: {
      language: "bash",
      title: "Evaluate a policy",
      code: `opa eval -i input.json -d policy.rego "data.authz.allow"`,
    },
    docsUrl: "https://www.openpolicyagent.org/docs/latest/",
    repoUrl: "https://github.com/open-policy-agent/opa",
  },
  {
    id: "kyverno",
    name: "Kyverno",
    layer: "security",
    maturity: "Incubating",
    summary: "Kubernetes-native policy management with validate/mutate/generate.",
    problem: "Cluster policy should be expressible without learning Rego.",
    levels: {
      beginner:
        "Install Kyverno and apply ClusterPolicies that validate resources.",
      intermediate:
        "Mutate defaults and generate supporting resources automatically.",
      advanced:
        "Cleanup policies, image verification, and policy exceptions at scale.",
    },
    useWhen: [
      "Kubernetes admission policy with YAML ergonomics",
      "Generate/mutate resources as part of policy",
    ],
    avoidWhen: [
      "You need one policy engine shared outside Kubernetes",
    ],
    alternatives: [
      { id: "opa", comparison: "OPA is broader; Kyverno is optimized for Kubernetes YAML policies." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["argo-cd", "flux"] },
    example: {
      language: "yaml",
      title: "Require labels",
      code: `apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: require-owner
spec:
  validationFailureAction: Enforce
  rules:
    - name: check-owner
      match:
        any:
          - resources:
              kinds: [Deployment]
      validate:
        message: "label owner is required"
        pattern:
          metadata:
            labels:
              owner: "?*"`,
    },
    docsUrl: "https://kyverno.io/docs/",
    repoUrl: "https://github.com/kyverno/kyverno",
  },
  {
    id: "cert-manager",
    name: "cert-manager",
    layer: "security",
    maturity: "Graduated",
    summary: "Automates X.509 certificate lifecycle in Kubernetes.",
    problem: "Manual certificate issuance and renewal causes outages.",
    levels: {
      beginner:
        "Install cert-manager and create an Issuer plus Certificate resources.",
      intermediate:
        "ACME HTTP-01/DNS-01 and private CAs for internal services.",
      advanced:
        "csi-driver, gateway integration, and multi-cluster issuance patterns.",
    },
    useWhen: [
      "Kubernetes workloads need automated TLS certificates",
      "Let's Encrypt or internal CA issuance should be declarative",
    ],
    avoidWhen: [
      "Certificates are fully managed outside the cluster with no in-cluster need",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes"], downstream: ["contour", "istio"] },
    example: {
      language: "yaml",
      title: "Certificate",
      code: `apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: www
spec:
  secretName: www-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
    - www.example.com`,
    },
    docsUrl: "https://cert-manager.io/docs/",
    repoUrl: "https://github.com/cert-manager/cert-manager",
  },
  {
    id: "spiffe",
    name: "SPIFFE",
    layer: "security",
    maturity: "Graduated",
    summary: "Standard for securely identifying software systems in dynamic environments.",
    problem: "IP-based identity fails in elastic cloud-native environments.",
    levels: {
      beginner:
        "Workloads get SPIFFE IDs (SPIFFE Verifiable Identity Documents).",
      intermediate:
        "SVIDs (X.509 or JWT) authenticate service-to-service calls.",
      advanced:
        "Federation across trust domains for multi-cluster/multi-cloud identity.",
    },
    useWhen: [
      "You need portable workload identity",
      "Zero-trust service authentication is a goal",
    ],
    avoidWhen: [
      "Simple cluster-network trust is explicitly enough for your threat model",
    ],
    alternatives: [
      { id: "spire", comparison: "SPIRE is the reference implementation that issues SPIFFE identities." },
    ],
    connectsTo: { upstream: ["kubernetes"], downstream: ["spire", "istio", "envoy"] },
    example: {
      language: "bash",
      title: "SPIFFE ID form",
      code: `echo "spiffe://example.org/ns/default/sa/checkout"`,
    },
    docsUrl: "https://spiffe.io/docs/latest/",
    repoUrl: "https://github.com/spiffe/spiffe",
  },
  {
    id: "spire",
    name: "SPIRE",
    layer: "security",
    maturity: "Graduated",
    summary: "SPIFFE Runtime Environment — issues and rotates workload identities.",
    problem: "Someone must attest nodes/workloads and mint short-lived SVIDs.",
    levels: {
      beginner:
        "SPIRE server + agent attest a workload and issue an X.509-SVID.",
      intermediate:
        "Selectors bind identities to Kubernetes SA/pod provenance.",
      advanced:
        "Nested SPIRE and federation across organizations.",
    },
    useWhen: [
      "You adopt SPIFFE and need a production issuer",
      "Short-lived mTLS identities for services",
    ],
    avoidWhen: [
      "Mesh-issued identities already fully meet your requirements",
    ],
    alternatives: [
      { id: "spiffe", comparison: "SPIFFE is the identity standard; SPIRE implements it." },
      { id: "istio", comparison: "Istio can issue mesh identities; SPIRE is SPIFFE-centric and mesh-agnostic." },
    ],
    connectsTo: { upstream: ["spiffe", "kubernetes"], downstream: ["envoy", "istio"] },
    example: {
      language: "bash",
      title: "Register a node entry (illustrative)",
      code: `spire-server entry show
spire-agent api fetch -write /tmp/svids`,
    },
    docsUrl: "https://spiffe.io/docs/latest/spire-about/",
    repoUrl: "https://github.com/spiffe/spire",
  },
  {
    id: "harbor",
    name: "Harbor",
    layer: "security",
    maturity: "Graduated",
    summary: "Cloud-native registry that stores, signs, and scans container images.",
    problem: "Teams need a secure private registry with vulnerability scanning and RBAC.",
    levels: {
      beginner:
        "Push/pull images to Harbor projects with user authentication.",
      intermediate:
        "Enable scanners, retention policies, and replication between registries.",
      advanced:
        "Content trust, robot accounts, and proxy cache for upstream hubs.",
    },
    useWhen: [
      "You need an on-prem/cloud private registry with security features",
      "Image scanning and replication are required",
    ],
    avoidWhen: [
      "Managed registry from your cloud provider is sufficient",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes", "tekton", "buildpacks"], downstream: ["falco", "kyverno"] },
    example: {
      language: "bash",
      title: "Docker login & push",
      code: `docker login harbor.example.com
docker tag my-app:1.0 harbor.example.com/library/my-app:1.0
docker push harbor.example.com/library/my-app:1.0`,
    },
    docsUrl: "https://goharbor.io/docs/",
    repoUrl: "https://github.com/goharbor/harbor",
  },
  {
    id: "notary",
    name: "Notary / Notation",
    layer: "security",
    maturity: "Graduated",
    summary: "CNCF signing ecosystem roots (Notary) with Notation for OCI artifact signing.",
    problem: "Unsigned images can be swapped or tampered with in the supply chain.",
    levels: {
      beginner:
        "Sign container images and verify signatures before deploy.",
      intermediate:
        "Integrate notation with CI and admission policy.",
      advanced:
        "Trust policies, key management, and multi-registry attestation workflows.",
    },
    useWhen: [
      "You need image signing and verification",
      "Supply-chain policy requires signatures",
    ],
    avoidWhen: [
      "Registry and deploy path cannot verify signatures yet",
    ],
    alternatives: [],
    connectsTo: { upstream: ["harbor", "kubernetes"], downstream: ["kyverno", "opa"] },
    example: {
      language: "bash",
      title: "Sign with notation",
      code: `notation sign harbor.example.com/library/my-app:1.0
notation verify harbor.example.com/library/my-app:1.0`,
    },
    docsUrl: "https://notaryproject.dev/docs/",
    repoUrl: "https://github.com/notaryproject/notation",
  },
  {
    id: "dragonfly",
    name: "Dragonfly",
    layer: "delivery",
    maturity: "Incubating",
    summary: "P2P-based file and image distribution system.",
    problem: "Large clusters pulling images from one registry create bandwidth bottlenecks.",
    levels: {
      beginner:
        "Dragonfly peers share image layers to speed pulls across nodes.",
      intermediate:
        "Manager/scheduler architecture integrates with Harbor and containerd.",
      advanced:
        "Multi-cluster distribution and bandwidth-aware scheduling.",
    },
    useWhen: [
      "Image pull storms overload your registry",
      "You operate large node fleets",
    ],
    avoidWhen: [
      "Cluster size does not stress registry bandwidth",
    ],
    alternatives: [
      { id: "harbor", comparison: "Harbor stores images; Dragonfly accelerates distribution of those images." },
    ],
    connectsTo: { upstream: ["harbor", "containerd"], downstream: ["kubernetes"] },
    example: {
      language: "bash",
      title: "Check dfget help",
      code: `dfget --help`,
    },
    docsUrl: "https://d7y.io/docs/",
    repoUrl: "https://github.com/dragonflyoss/dragonfly",
  },
  {
    id: "chaos-mesh",
    name: "Chaos Mesh",
    layer: "observability",
    maturity: "Incubating",
    summary: "Chaos engineering platform for Kubernetes reliability testing.",
    problem: "Failure modes stay unknown until production incidents.",
    levels: {
      beginner:
        "Apply a PodChaos experiment to kill pods and watch recovery.",
      intermediate:
        "NetworkChaos and StressChaos test latency and resource limits.",
      advanced:
        "Workflows schedule multi-step chaos safely in production-like envs.",
    },
    useWhen: [
      "You practice chaos engineering on Kubernetes",
      "You need declarative fault injection",
    ],
    avoidWhen: [
      "You lack observability to interpret experiment results",
    ],
    alternatives: [],
    connectsTo: { upstream: ["kubernetes"], downstream: ["prometheus", "jaeger"] },
    example: {
      language: "yaml",
      title: "PodChaos",
      code: `apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-kill
spec:
  action: pod-kill
  mode: one
  selector:
    namespaces: [default]
    labelSelectors:
      app: web
  scheduler:
    cron: "@every 10m"`,
    },
    docsUrl: "https://chaos-mesh.org/docs/",
    repoUrl: "https://github.com/chaos-mesh/chaos-mesh",
  },
  {
    id: "grpc",
    name: "gRPC",
    layer: "networking",
    maturity: "Graduated",
    summary: "High-performance RPC framework using HTTP/2 and Protocol Buffers.",
    problem: "Ad-hoc HTTP JSON APIs struggle with strongly typed, efficient service calls.",
    levels: {
      beginner:
        "Define a .proto service and generate clients/servers.",
      intermediate:
        "Streaming RPCs, deadlines, and interceptors shape production APIs.",
      advanced:
        "Load balancing, xDS, and mesh integration for large fleets.",
    },
    useWhen: [
      "Internal service APIs need efficiency and strong contracts",
      "Polyglot clients share one IDL",
    ],
    avoidWhen: [
      "Public browser clients need simple REST/JSON without grpc-web",
    ],
    alternatives: [],
    connectsTo: { upstream: ["envoy", "istio"], downstream: ["opentelemetry", "prometheus"] },
    example: {
      language: "bash",
      title: "Proto service sketch",
      code: `syntax = "proto3";
service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}
message HelloRequest { string name = 1; }
message HelloReply { string message = 1; }`,
    },
    docsUrl: "https://grpc.io/docs/",
    repoUrl: "https://github.com/grpc/grpc",
  },
];

export function getTool(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByLayer(layer: string): Tool[] {
  return tools.filter((t) => t.layer === layer);
}

export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((t) => {
    const hay = [
      t.name,
      t.summary,
      t.problem,
      t.layer,
      t.maturity,
      ...t.useWhen,
      ...t.avoidWhen,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export const toolCount = tools.length;
