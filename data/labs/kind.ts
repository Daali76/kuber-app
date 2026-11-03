import type { LabStep } from "@/lib/types";

export const kindSetupBasic: LabStep = {
  id: "kind-setup",
  title: {
    en: "Create a practice cluster (kind)",
    fa: "ساخت کلاستر تمرین (kind)",
  },
  command: {
    language: "bash",
    title: "kind create",
    code: `kind create cluster --name cna-lab
kubectl cluster-info --context kind-cna-lab`,
  },
  expectedOutput: `Creating cluster "cna-lab" ...
 ✓ Ensuring node image (kindest/node) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-cna-lab"
Kubernetes control plane is running at https://127.0.0.1:xxxxx`,
  whatHappened: {
    en: "kind started a local Kubernetes control plane and worker inside Docker and pointed kubectl at it.",
    fa: "kind یک control plane و worker محلی داخل Docker ساخت و kubectl را به آن اشاره داد.",
  },
  diagramComponentIds: ["apiserver", "etcd", "kubelet"],
};

export const minikubeAlt: LabStep = {
  id: "minikube-alt",
  title: {
    en: "Alternative: minikube",
    fa: "جایگزین: minikube",
  },
  command: {
    language: "bash",
    title: "minikube start",
    code: `minikube start -p cna-lab
kubectl get nodes`,
  },
  expectedOutput: `😄  minikube v1.x.x on Darwin
✨  Using the docker driver
👍  Starting control plane node cna-lab in cluster cna-lab
🏄  Done! kubectl is now configured to use "cna-lab"
NAME       STATUS   ROLES           AGE   VERSION
cna-lab    Ready    control-plane   30s   v1.xx.x`,
  whatHappened: {
    en: "minikube created a local cluster profile and configured your kubeconfig.",
    fa: "minikube یک پروفایل کلاستر محلی ساخت و kubeconfig را تنظیم کرد.",
  },
  diagramComponentIds: ["apiserver", "kubelet"],
};

export const kindCleanup: LabStep = {
  id: "cleanup",
  title: { en: "Cleanup", fa: "پاک‌سازی" },
  command: {
    language: "bash",
    title: "kind delete",
    code: `kind delete cluster --name cna-lab
# or: minikube delete -p cna-lab`,
  },
  expectedOutput: `Deleting cluster "cna-lab" ...`,
  whatHappened: {
    en: "The local practice cluster and its containers were removed.",
    fa: "کلاستر تمرین محلی و کانتینرهایش حذف شدند.",
  },
};

/** kind config disabling default CNI — required for Cilium per Cilium kind docs. */
export const kindSetupNoCni: LabStep = {
  id: "kind-setup-no-cni",
  title: {
    en: "Create kind cluster without default CNI (for Cilium)",
    fa: "ساخت kind بدون CNI پیش‌فرض (برای Cilium)",
  },
  command: {
    language: "bash",
    title: "kind + disable default CNI",
    code: `cat <<EOF | kind create cluster --name cna-cilium --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  disableDefaultCNI: true
  kubeProxyMode: none
nodes:
  - role: control-plane
  - role: worker
EOF
kubectl get nodes`,
  },
  expectedOutput: `Creating cluster "cna-cilium" ...
 ✓ Ensuring node image
 ✓ Preparing nodes
 ✓ Writing configuration
 ✓ Starting control-plane
Set kubectl context to "kind-cna-cilium"
NAME                       STATUS     ROLES           AGE   VERSION
cna-cilium-control-plane   NotReady   control-plane   10s   v1.xx.x
cna-cilium-worker          NotReady   <none>          9s    v1.xx.x`,
  whatHappened: {
    en: "Nodes stay NotReady until Cilium (or another CNI) is installed — expected with disableDefaultCNI.",
    fa: "تا نصب Cilium (یا CNI دیگر) نودها NotReady می‌مانند — با disableDefaultCNI طبیعی است.",
  },
  diagramComponentIds: ["apiserver", "kubelet"],
};
