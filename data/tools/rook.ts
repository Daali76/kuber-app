import { clusterBase, mergeDiagram } from "./_base";

const base = clusterBase({
  highlightApi: true,
  highlightAppPod: true,
});

export const rook = {
  id: "rook",
  name: "Rook",
  layer: "storage",
  maturity: "Graduated",
  summary: "Cloud-native storage orchestrator — commonly Ceph on Kubernetes.",
  problem:
    "Stateful apps need automated, resilient block/file/object storage in-cluster.",
  placementBlurb: "Operator + Ceph mons/OSDs on nodes + CSI provisioner",
  levels: {
    beginner:
      "Rook operators install and manage Ceph so you can request PersistentVolumes.",
    intermediate: "StorageClasses for RBD, CephFS, and RGW serve different workloads.",
    advanced: "Device management and upgrade strategies for large fleets.",
  },
  useWhen: [
    "You need self-managed software-defined storage on Kubernetes",
    "Block, file, and object from one Ceph cluster",
  ],
  avoidWhen: [
    "Managed cloud disks are simpler and sufficient",
    "Team cannot operate Ceph",
  ],
  alternatives: [],
  docsUrl: "https://rook.io/docs/rook/latest/",
  repoUrl: "https://github.com/rook/rook",
  diagram: mergeDiagram(base, {
    components: [
      {
        id: "rook-operator",
        label: "Rook operator",
        zone: "namespace",
        slot: "operator",
        objectType: "Operator",
        description: "Operator Deployment in rook-ceph reconciling CephCluster CRs.",
        whyThere: "Orchestrates Ceph daemons via the Kubernetes API.",
        highlight: true,
        stepIds: ["install", "verify"],
      },
      {
        id: "ceph-mons",
        label: "Ceph monitors",
        zone: "namespace",
        slot: "mons",
        objectType: "Deployment",
        description: "Ceph mon quorum pods.",
        whyThere: "Cluster membership/quorum components managed as pods.",
        highlight: true,
        stepIds: ["example"],
      },
      {
        id: "ceph-osds",
        label: "Ceph OSDs",
        zone: "worker-node",
        slot: "osd",
        objectType: "Pod",
        description: "OSD pods consuming node devices for data.",
        whyThere: "Data planes need local disks on workers.",
        highlight: true,
        stepIds: ["example", "test"],
      },
      {
        id: "csi",
        label: "Ceph CSI",
        zone: "namespace",
        slot: "csi",
        objectType: "DaemonSet",
        description: "CSI provisioner/plugin mounting volumes into pods.",
        whyThere: "Volume attach/mount happens on the node hosting the pod.",
        highlight: true,
        stepIds: ["test"],
      },
      {
        id: "cloud-storage",
        label: "Node disks",
        zone: "external",
        slot: "storage",
        objectType: "External",
        description: "Physical/logical disks consumed by OSDs.",
        whyThere: "Durable bytes ultimately live on node-attached media.",
        highlight: true,
        stepIds: ["example"],
      },
    ],
    connections: [
      {
        id: "operator-api",
        from: "rook-operator",
        to: "apiserver",
        label: "reconcile CephCluster",
        highlight: true,
        stepIds: ["install", "example"],
      },
      {
        id: "csi-api",
        from: "csi",
        to: "apiserver",
        label: "PV/PVC provision",
        highlight: true,
        stepIds: ["test"],
      },
      {
        id: "pod-csi",
        from: "app-pod",
        to: "csi",
        label: "mount volume",
        highlight: true,
        stepIds: ["test"],
      },
      {
        id: "osd-disk",
        from: "ceph-osds",
        to: "cloud-storage",
        label: "read/write devices",
        highlight: true,
        stepIds: ["example"],
      },
    ],
  }),
  implement: [
    {
      id: "prereq",
      title: "Prerequisites",
      description:
        "Nodes with raw devices or partitions for OSDs; enough CPU/RAM for mons/OSDs. Follow Rook Ceph prerequisites for your version.",
      code: {
        language: "bash",
        title: "Nodes",
        code: `kubectl get nodes -o wide`,
      },
      diagramComponentIds: ["cloud-storage"],
    },
    {
      id: "install",
      title: "Install",
      description: "Install Rook operator common + operator manifests (versioned release).",
      code: {
        language: "bash",
        title: "Operator manifests",
        code: `kubectl create -f https://raw.githubusercontent.com/rook/rook/v1.21.1/deploy/examples/crds.yaml
kubectl create -f https://raw.githubusercontent.com/rook/rook/v1.21.1/deploy/examples/common.yaml
kubectl create -f https://raw.githubusercontent.com/rook/rook/v1.21.1/deploy/examples/operator.yaml`,
      },
      diagramComponentIds: ["rook-operator"],
      diagramConnectionIds: ["operator-api"],
    },
    {
      id: "verify",
      title: "Verify",
      description: "Operator pod Running in rook-ceph.",
      code: {
        language: "bash",
        title: "Operator",
        code: `kubectl -n rook-ceph get pods`,
      },
      expectedOutput: `rook-ceph-operator-...   Running`,
      diagramComponentIds: ["rook-operator"],
    },
    {
      id: "example",
      title: "Minimal working example",
      description:
        "Apply a CephCluster example (cluster.yaml) from the same Rook version, then a StorageClass.",
      code: {
        language: "bash",
        title: "CephCluster",
        code: `kubectl create -f https://raw.githubusercontent.com/rook/rook/v1.21.1/deploy/examples/cluster.yaml
kubectl -n rook-ceph get cephcluster`,
      },
      diagramComponentIds: [
        "ceph-mons",
        "ceph-osds",
        "rook-operator",
        "cloud-storage",
      ],
      diagramConnectionIds: ["operator-api", "osd-disk"],
    },
    {
      id: "test",
      title: "How to test",
      description: "Create a PVC using the Rook StorageClass and mount it in a Pod.",
      code: {
        language: "yaml",
        title: "pvc-pod.yaml",
        code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: rook-pvc
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: rook-ceph-block
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: csitest
spec:
  containers:
    - name: busybox
      image: busybox:1.36
      command: ["sleep", "3600"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: rook-pvc`,
      },
      diagramComponentIds: ["csi", "app-pod", "ceph-osds"],
      diagramConnectionIds: ["csi-api", "pod-csi"],
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      description:
        "No clean disks for OSDs; mixing Rook versions between CRDs and operator; expecting instant health before OSDs join.",
      code: {
        language: "bash",
        title: "Ceph status",
        code: `kubectl create -f https://raw.githubusercontent.com/rook/rook/v1.21.1/deploy/examples/toolbox.yaml
kubectl -n rook-ceph rollout status deploy/rook-ceph-tools
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph status`,
      },
      diagramComponentIds: ["rook-operator", "ceph-mons", "ceph-osds"],
    },
  ],
};
