import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightKubelet: true,
  highlightRuntime: true,
  highlightAppPod: true,
});

export const containerd = {
  id: "containerd",
  name: "containerd",
  layer: "runtime",
  maturity: "Graduated",
  summary:
    "Industry-standard container runtime with an emphasis on simplicity and robustness.",
  problem: "Kubernetes nodes need a CRI runtime to pull images and run containers.",
  placementBlurb: "Node process under kubelet (CRI)",
  levels: {
    beginner:
      "containerd runs containers on a host; kubelet talks to it through the CRI plugin.",
    intermediate:
      "ctr/nerdctl, snapshotters, and registries configure image pulls and storage.",
    advanced:
      "Shim APIs and custom snapshotters support specialized workloads.",
  },
  useWhen: [
    "You want the default runtime used by most Kubernetes distributions",
    "You need a focused runtime without a full Docker Engine",
  ],
  avoidWhen: [
    "Your distribution standardizes on CRI-O instead",
  ],
  alternatives: [
    {
      id: "kubernetes",
      comparison: "Kubernetes schedules pods; containerd executes containers on the node.",
    },
  ],
  docsUrl: "https://containerd.io/docs/",
  repoUrl: "https://github.com/containerd/containerd",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "runtime",
        label: "containerd",
        zone: "worker-node",
        slot: "runtime",
        objectType: "NodeProcess",
        description: "containerd daemon with the CRI plugin enabled for kubelet.",
        whyThere: "Must run on each worker node beside kubelet.",
        highlight: true,
        stepIds: ["install", "verify", "example"],
      },
      {
        id: "kubelet",
        label: "kubelet",
        zone: "worker-node",
        slot: "kubelet",
        objectType: "NodeProcess",
        description: "Talks to containerd over the CRI gRPC socket.",
        whyThere: "kubelet is the only component that should drive the CRI runtime.",
        highlight: true,
        stepIds: ["verify"],
      },
    ],
    connections: [
      {
        id: "kubelet-runtime",
        from: "kubelet",
        to: "runtime",
        label: "CRI gRPC (unix:///run/containerd/containerd.sock)",
        highlight: true,
        stepIds: ["verify", "example"],
      },
      {
        id: "runtime-pod",
        from: "runtime",
        to: "app-pod",
        label: "create/start containers",
        highlight: true,
        stepIds: ["example", "test"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description:
        "Linux worker node; for Kubernetes, configure kubelet `--container-runtime-endpoint` to containerd's CRI socket.",
      code: {
        language: "bash",
        title: "Socket path",
        code: `ls -l /run/containerd/containerd.sock`,
      },
      diagramComponentIds: ["runtime"],
    },
    {
      id: "install",
      title: "Install",
      description:
        "Write the default config first (with SystemdCgroup for kubelet), then enable and restart the service.",
      code: {
        language: "bash",
        title: "config then systemd",
        code: `sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
# Kubernetes expects the runc runtime to use systemd cgroups (not cgroupfs).
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl enable --now containerd
sudo systemctl restart containerd`,
      },
      diagramComponentIds: ["runtime", "kubelet"],
      diagramConnectionIds: ["kubelet-runtime"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Confirm CRI is reachable and Kubernetes nodes use containerd.",
      code: {
        language: "bash",
        title: "crictl + node runtime",
        code: `sudo crictl --runtime-endpoint unix:///run/containerd/containerd.sock info
kubectl get nodes -o wide`,
      },
      expectedOutput: `Container Runtime Version: ...containerd...`,
      diagramComponentIds: ["runtime", "kubelet"],
      diagramConnectionIds: ["kubelet-runtime"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description: "Pull and run a container with nerdctl (or ctr) on the node.",
      code: {
        language: "bash",
        title: "nerdctl",
        code: `sudo nerdctl pull nginx:1.27-alpine
sudo nerdctl run --rm -p 8080:80 nginx:1.27-alpine`,
      },
      diagramComponentIds: ["runtime", "app-pod"],
      diagramConnectionIds: ["runtime-pod"],
    },
    {
      id: "test",
      title: "How to test",
      description: "From Kubernetes, start a Pod and confirm containers via crictl.",
      code: {
        language: "bash",
        title: "List containers",
        code: `kubectl run probe --image=nginx:1.27-alpine --restart=Never
sudo crictl ps`,
      },
      diagramComponentIds: ["runtime", "app-pod", "kubelet"],
      diagramConnectionIds: ["kubelet-runtime", "runtime-pod"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "Leaving SystemdCgroup = false (pods fail cgroup setup with systemd kubelet); kubelet pointed at the wrong socket; CRI plugin disabled in config.toml; sandbox image not pullable (pause image).",
      code: {
        language: "bash",
        title: "Check cgroup + kubelet",
        code: `grep SystemdCgroup /etc/containerd/config.toml
ps aux | grep kubelet | tr ' ' '\\n' | grep container-runtime`,
      },
      diagramComponentIds: ["runtime", "kubelet"],
    },
  ],
};
