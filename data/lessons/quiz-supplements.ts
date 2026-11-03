import type { QuizQuestion } from "@/lib/types";
import { q } from "./quiz-helper";

/** Two extra questions per core lesson → 5 total each. */
export const QUIZ_SUPPLEMENTS: Partial<Record<string, QuizQuestion[]>> = {
  "container-image": [
    q(
      "ci4",
      { en: "ImagePullPolicy IfNotPresent means…", fa: "ImagePullPolicy برابر IfNotPresent یعنی…" },
      [
        { en: "Always pull on every restart", fa: "همیشه pull" },
        { en: "Pull only if missing locally", fa: "فقط اگر محلی نبود pull" },
        { en: "Never pull", fa: "هرگز pull نکن" },
      ],
      1,
      { en: "kubelet skips pull when the image is already present.", fa: "kubelet اگر image روی Node باشد pull نمی‌کند." },
    ),
    q(
      "ci5",
      { en: "A digest pin (image@sha256:…) helps…", fa: "سنجاق digest (image@sha256:…) کمک می‌کند…" },
      [
        { en: "Guarantee immutable content", fa: "محتوای تغییرناپذیر تضمین شود" },
        { en: "Disable networking", fa: "شبکه خاموش شود" },
        { en: "Replace RBAC", fa: "جای RBAC بنشیند" },
      ],
      0,
      { en: "Tags can move; digests identify exact layer content.", fa: "tag جابه‌جا می‌شود؛ digest محتوای دقیق لایه را مشخص می‌کند." },
    ),
  ],
  pod: [
    q("p4", { en: "RestartPolicy Never means…", fa: "RestartPolicy برابر Never یعنی…" }, [
      { en: "kubelet restarts forever", fa: "kubelet همیشه restart" },
      { en: "Container stays stopped after exit", fa: "بعد از exit متوقف بماند" },
      { en: "Pod gets a new IP each second", fa: "هر ثانیه IP جدید" },
    ], 1, { en: "Common for Jobs or debug Pods.", fa: "برای Job یا Pod دیباگ رایج است." }),
    q("p5", { en: "Readiness failure usually…", fa: "شکست readiness معمولاً…" }, [
      { en: "Removes Pod from Service endpoints", fa: "Pod را از Endpoint Service حذف می‌کند" },
      { en: "Deletes etcd", fa: "etcd را پاک می‌کند" },
      { en: "Changes cluster version", fa: "نسخه کلاستر را عوض می‌کند" },
    ], 0, { en: "Not ready → no traffic until probe passes.", fa: "NotReady → تا pass شدن probe ترافیک نمی‌گیرد." }),
  ],
  "node-kubelet": [
    q("n4", { en: "Node NotReady often traces to…", fa: "Node NotReady اغلب به…" }, [
      { en: "kubelet or runtime issues", fa: "مشکل kubelet یا runtime" },
      { en: "Ingress only", fa: "فقط Ingress" },
      { en: "Helm repos", fa: "ریپوی Helm" },
    ], 0, { en: "Check kubelet logs and runtime socket.", fa: "لاگ kubelet و سوکت runtime را ببینید." }),
    q("n5", { en: "Taints on a Node…", fa: "taint روی Node…" }, [
      { en: "Repel Pods unless tolerated", fa: "Pod را دور می‌کند مگر toleration" },
      { en: "Encrypt Secrets", fa: "Secret را رمز می‌کند" },
      { en: "Replace DNS", fa: "DNS را عوض می‌کند" },
    ], 0, { en: "Scheduler respects taints/tolerations.", fa: "scheduler به taint/toleration احترام می‌گذارد." }),
  ],
  "control-plane": [
    q("cp4", { en: "Admission happens…", fa: "admission چه زمانی است؟" }, [
      { en: "After authn/authz, before persist", fa: "بعد از authn/authz، قبل از ذخیره" },
      { en: "Only on worker nodes", fa: "فقط روی worker" },
      { en: "After containers start", fa: "بعد از start container" },
    ], 0, { en: "Mutating/validating hooks run in this window.", fa: "hookهای mutate/validate اینجا اجرا می‌شوند." }),
    q("cp5", { en: "etcd quorum loss means…", fa: "از دست رفتن quorum در etcd یعنی…" }, [
      { en: "API writes may fail", fa: "نوشتن API ممکن است fail شود" },
      { en: "Pods auto-scale to zero", fa: "Pod خودکار صفر می‌شود" },
      { en: "Ingress stops TLS", fa: "Ingress TLS را قطع می‌کند" },
    ], 0, { en: "Control plane needs majority of etcd members.", fa: "control plane به اکثریت اعضای etcd نیاز دارد." }),
  ],
  "deployment-replicaset": [
    q("d4", { en: "maxSurge controls…", fa: "maxSurge چه چیزی را کنترل می‌کند؟" }, [
      { en: "Extra Pods during rollout", fa: "Pod اضافه هنگام rollout" },
      { en: "etcd size", fa: "اندازه etcd" },
      { en: "DNS TTL", fa: "TTL در DNS" },
    ], 0, { en: "Allows temporary capacity above desired replicas.", fa: "موقتاً ظرفیت بالاتر از replica مطلوب مجاز است." }),
    q("d5", { en: "kubectl rollout history shows…", fa: "kubectl rollout history چه نشان می‌دهد؟" }, [
      { en: "ReplicaSet revisions", fa: "revisionهای ReplicaSet" },
      { en: "Node kernel versions", fa: "نسخه کرنل Node" },
      { en: "Container image layers", fa: "لایه‌های image" },
    ], 0, { en: "Each revision maps to a ReplicaSet template.", fa: "هر revision به قالب ReplicaSet وصل است." }),
  ],
  "service-dns": [
    q("s4", { en: "kube-proxy (or eBPF) implements…", fa: "kube-proxy (یا eBPF) چه چیزی را پیاده می‌کند؟" }, [
      { en: "Service → Pod forwarding rules", fa: "قواعد Service → Pod" },
      { en: "Git pushes", fa: "push به Git" },
      { en: "CRD registration", fa: "ثبت CRD" },
    ], 0, { en: "Dataplane programs rules from Service/EndpointSlice.", fa: "dataplane از Service/EndpointSlice قواعد می‌سازد." }),
    q("s5", { en: "Wrong namespace in DNS name causes…", fa: "namespace اشتباه در نام DNS باعث…" }, [
      { en: "NXDOMAIN / no such Service", fa: "NXDOMAIN / Service پیدا نشود" },
      { en: "Automatic Pod migration", fa: "مهاجرت خودکار Pod" },
      { en: "Scheduler upgrade", fa: "ارتقای scheduler" },
    ], 0, { en: "Names are scoped: svc.ns.svc.cluster.local.", fa: "نام محدوده دارد: svc.ns.svc.cluster.local." }),
  ],
  namespace: [
    q("ns4", { en: "ResourceQuota limits…", fa: "ResourceQuota چه چیزی را محدود می‌کند؟" }, [
      { en: "Aggregate resource use in a namespace", fa: "مصرف تجمیعی در Namespace" },
      { en: "Global cluster CPU only", fa: "فقط CPU کل کلاستر" },
      { en: "Git branch count", fa: "تعداد branch در Git" },
    ], 0, { en: "Prevents one tenant from starving others.", fa: "از قحطی منابع توسط یک tenant جلوگیری می‌کند." }),
    q("ns5", { en: "kubectl config set-context --namespace…", fa: "kubectl config set-context --namespace…" }, [
      { en: "Sets default namespace for that context", fa: "Namespace پیش‌فرض همان context" },
      { en: "Creates a new cluster", fa: "کلاستر جدید می‌سازد" },
      { en: "Deletes kube-system", fa: "kube-system را پاک می‌کند" },
    ], 0, { en: "Avoid typing -n on every command.", fa: "دیگر لازم نیست هر بار -n بزنید." }),
  ],
  "configmap-secret": [
    q("cs4", { en: "immutable: true on a Secret…", fa: "immutable: true روی Secret…" }, [
      { en: "Blocks updates to data keys", fa: "به‌روزرسانی کلیدها را می‌بندد" },
      { en: "Disables RBAC", fa: "RBAC را خاموش می‌کند" },
      { en: "Forces plaintext in Git", fa: "متن plain در Git اجبار می‌کند" },
    ], 0, { en: "Use for credentials that rotate by replace.", fa: "برای credential که با جایگزینی rotate می‌شود." }),
    q("cs5", { en: "secretKeyRef in env…", fa: "secretKeyRef در env…" }, [
      { en: "Injects one key as an environment variable", fa: "یک کلید را به env inject می‌کند" },
      { en: "Mounts a PersistentVolume", fa: "PersistentVolume mount می‌کند" },
      { en: "Creates an Ingress", fa: "Ingress می‌سازد" },
    ], 0, { en: "Values appear in Pod spec (protect etcd/RBAC).", fa: "مقدار در spec Pod دیده می‌شود (etcd/RBAC را محافظت کنید)." }),
  ],
  daemonset: [
    q("ds4", { en: "On node drain, DaemonSet Pods…", fa: "هنگام drain Node، Podهای DaemonSet…" }, [
      { en: "Are evicted like other Pods", fa: "مثل بقیه Pod تخلیه می‌شوند" },
      { en: "Never stop", fa: "هرگز متوقف نمی‌شوند" },
      { en: "Move to etcd", fa: "به etcd می‌روند" },
    ], 0, { en: "Respect eviction and scheduling rules.", fa: "به قواعد eviction و زمان‌بندی پایبندند." }),
    q("ds5", { en: "nodeSelector on DaemonSet…", fa: "nodeSelector روی DaemonSet…" }, [
      { en: "Limits which nodes run the Pod", fa: "Nodeهای اجرا را محدود می‌کند" },
      { en: "Changes Service type", fa: "نوع Service را عوض می‌کند" },
      { en: "Replaces CoreDNS", fa: "جای CoreDNS می‌نشیند" },
    ], 0, { en: "Combine with tolerations for control-plane agents.", fa: "با toleration برای agent روی control plane ترکیب کنید." }),
  ],
  statefulset: [
    q("ss4", { en: "podManagementPolicy Parallel…", fa: "podManagementPolicy برابر Parallel…" }, [
      { en: "Starts ordinals concurrently", fa: "ordinalها هم‌زمان بالا می‌آیند" },
      { en: "Disables PVCs", fa: "PVC را غیرفعال می‌کند" },
      { en: "Removes DNS", fa: "DNS را حذف می‌کند" },
    ], 0, { en: "Ordered policy waits pod-0 before pod-1.", fa: "Ordered منتظر pod-0 قبل از pod-1 می‌ماند." }),
    q("ss5", { en: "Stable network ID looks like…", fa: "شناسه شبکه پایدار شبیه…" }, [
      { en: "sts-0.sts-svc.ns.svc.cluster.local", fa: "sts-0.sts-svc.ns.svc.cluster.local" },
      { en: "random UUID only", fa: "فقط UUID تصادفی" },
      { en: "node external IP", fa: "IP خارجی Node" },
    ], 0, { en: "Headless Service backs per-Pod DNS.", fa: "Service headless، DNS به‌ازای Pod می‌دهد." }),
  ],
  ingress: [
    q("in4", { en: "pathType Prefix…", fa: "pathType برابر Prefix…" }, [
      { en: "Matches URL prefix segments", fa: "پیشوند مسیر URL را match می‌کند" },
      { en: "Encrypts etcd", fa: "etcd را رمز می‌کند" },
      { en: "Sets Pod CPU", fa: "CPU Pod را ست می‌کند" },
    ], 0, { en: "ImplementationSpecific depends on controller.", fa: "ImplementationSpecific به controller بستگی دارد." }),
    q("in5", { en: "TLS secret on Ingress references…", fa: "Secret TLS روی Ingress به…" }, [
      { en: "tls.crt and tls.key in a Secret", fa: "tls.crt و tls.key در Secret" },
      { en: "Only ConfigMap data", fa: "فقط داده ConfigMap" },
      { en: "Node SSH keys", fa: "کلید SSH Node" },
    ], 0, { en: "Controller loads cert for SNI/host rules.", fa: "controller گواهی را برای قواعد host/SNI بار می‌کند." }),
  ],
  "crd-operator": [
    q("co4", { en: "status subresource lets controllers…", fa: "subresource status به کنترلر اجازه…" }, [
      { en: "Update observed state separately from spec", fa: "وضعیت مشاهده‌شده را جدا از spec به‌روز کند" },
      { en: "Bypass RBAC entirely", fa: "کاملاً از RBAC عبور کند" },
      { en: "Delete Nodes", fa: "Node را پاک کند" },
    ], 0, { en: "Users patch spec; controllers patch status.", fa: "کاربر spec را patch می‌کند؛ کنترلر status." }),
    q("co5", { en: "Operator pattern is…", fa: "الگوی Operator یعنی…" }, [
      { en: "Domain controller + custom API types", fa: "کنترلر دامنه + نوع API سفارشی" },
      { en: "A replacement for kubelet", fa: "جایگزین kubelet" },
      { en: "Only a Helm plugin", fa: "فقط پلاگین Helm" },
    ], 0, { en: "Encodes operational knowledge in software.", fa: "دانش عملیاتی را در نرم‌افزار کد می‌کند." }),
  ],
  "admission-webhook": [
    q("aw4", { en: "timeoutSeconds on webhooks…", fa: "timeoutSeconds روی webhook…" }, [
      { en: "Bounds how long API waits for response", fa: "مدت انتظار API را محدود می‌کند" },
      { en: "Sets Pod memory", fa: "حافظه Pod را ست می‌کند" },
      { en: "Changes Service CIDR", fa: "CIDR Service را عوض می‌کند" },
    ], 0, { en: "Slow webhooks block cluster writes.", fa: "webhook کند، نوشتن کلاستر را می‌بندد." }),
    q("aw5", { en: "sideEffects: None means…", fa: "sideEffects: None یعنی…" }, [
      { en: "Webhook will not kube-apiserver side effects outside admission", fa: "اثر جانبی خارج از admission ندارد" },
      { en: "Always deletes Pods", fa: "همیشه Pod پاک می‌کند" },
      { en: "Disables mutations", fa: "mutation را خاموش می‌کند" },
    ], 0, { en: "Important for dry-run compatibility.", fa: "برای سازگاری dry-run مهم است." }),
  ],
  sidecar: [
    q("sc4", { en: "initContainers run…", fa: "initContainerها…" }, [
      { en: "Before app containers, sequentially", fa: "قبل از container اپ، به‌ترتیب" },
      { en: "Only after Pod deletion", fa: "فقط بعد از حذف Pod" },
      { en: "On the API server", fa: "روی API server" },
    ], 0, { en: "Useful for setup jobs before main containers.", fa: "برای آماده‌سازی قبل از container اصلی." }),
    q("sc5", { en: "Shared emptyDir volume…", fa: "volume emptyDir مشترک…" }, [
      { en: "Lets sidecar and app exchange files on the node", fa: "تبادل فایل بین sidecar و اپ روی Node" },
      { en: "Persists after Pod deletion forever", fa: "بعد از حذف Pod برای همیشه می‌ماند" },
      { en: "Replaces etcd", fa: "جای etcd می‌نشیند" },
    ], 0, { en: "Ephemeral but fast local sharing.", fa: "موقتی اما سریع برای اشتراک محلی." }),
  ],
};
