"use client";

import { useI18n } from "@/lib/i18n";

export function RollingSliders({
  replicas,
  maxSurge,
  maxUnavailable,
  onChange,
}: {
  replicas: number;
  maxSurge: number;
  maxUnavailable: number;
  onChange: (next: {
    replicas: number;
    maxSurge: number;
    maxUnavailable: number;
  }) => void;
}) {
  const { lang } = useI18n();
  const surgePods = Math.max(1, Math.ceil((replicas * maxSurge) / 100));
  const unavailPods = Math.floor((replicas * maxUnavailable) / 100);
  const maxUnavailableAbs = Math.max(0, unavailPods);
  const maxSurgeAbs = Math.max(0, surgePods);

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[15px] font-semibold text-slate-100">
        {lang === "fa"
          ? "کنترل RollingUpdate (درصد مثل مستندات Kubernetes)"
          : "RollingUpdate controls (percent form per Kubernetes docs)"}
      </p>
      <Slider
        label={lang === "fa" ? "replicas" : "replicas"}
        value={replicas}
        min={1}
        max={12}
        onChange={(replicas) =>
          onChange({ replicas, maxSurge, maxUnavailable })
        }
      />
      <Slider
        label="maxSurge %"
        value={maxSurge}
        min={0}
        max={100}
        step={5}
        onChange={(maxSurge) =>
          onChange({ replicas, maxSurge, maxUnavailable })
        }
      />
      <Slider
        label="maxUnavailable %"
        value={maxUnavailable}
        min={0}
        max={100}
        step={5}
        onChange={(maxUnavailable) =>
          onChange({ replicas, maxSurge, maxUnavailable })
        }
      />
      <p className="text-sm text-slate-400" dir="ltr">
        ≈ maxSurge {maxSurgeAbs} Pod(s), maxUnavailable {maxUnavailableAbs}{" "}
        Pod(s) at {replicas} replicas
      </p>
      <p className="text-sm text-slate-500">
        {lang === "fa"
          ? "انیمیشن Play این کران‌ها را در کپشن گام‌ها منعکس می‌کند؛ readiness همچنان پیشرفت را محدود می‌کند."
          : "Play-flow captions reflect these bounds; readiness still gates progress."}
      </p>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1 flex justify-between gap-2">
        <span>{label}</span>
        <span className="font-mono text-teal-200" dir="ltr">
          {value}
        </span>
      </span>
      <input
        type="range"
        className="w-full accent-teal-400"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
