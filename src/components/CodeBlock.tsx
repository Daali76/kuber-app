import type { CodeSnippet } from "@/lib/types";

const KEYWORDS = new Set([
  "apiVersion",
  "kind",
  "metadata",
  "spec",
  "name",
  "namespace",
  "resource",
  "true",
  "false",
  "null",
]);

function highlightLine(line: string, language: string): React.ReactNode[] {
  if (language === "bash") {
    if (line.trimStart().startsWith("#")) {
      return [<span key="c" className="text-slate-500">{line}</span>];
    }
    const parts = line.split(/(\s+)/);
    return parts.map((part, i) => {
      if (i === 0 || (parts[i - 1] === undefined && part)) {
        return (
          <span key={i} className="text-teal-300">
            {part}
          </span>
        );
      }
      if (part.startsWith("-") || part.startsWith("--")) {
        return (
          <span key={i} className="text-amber-300">
            {part}
          </span>
        );
      }
      if (part.startsWith('"') || part.startsWith("'")) {
        return (
          <span key={i} className="text-lime-300">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  // yaml / hcl-ish
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === "#" || (language === "hcl" && line.slice(i, i + 2) === "//")) {
      nodes.push(
        <span key={i} className="text-slate-500">
          {line.slice(i)}
        </span>,
      );
      break;
    }
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) j++;
      nodes.push(
        <span key={i} className="text-lime-300">
          {line.slice(i, j + 1)}
        </span>,
      );
      i = j + 1;
      continue;
    }
    const rest = line.slice(i);
    const keyMatch = rest.match(/^([A-Za-z_][\w.-]*)(:)/);
    if (keyMatch) {
      const isKw = KEYWORDS.has(keyMatch[1]);
      nodes.push(
        <span key={i} className={isKw ? "text-sky-300" : "text-teal-200"}>
          {keyMatch[1]}
        </span>,
      );
      nodes.push(
        <span key={`${i}:`} className="text-slate-500">
          :
        </span>,
      );
      i += keyMatch[0].length;
      continue;
    }
    const word = rest.match(/^[A-Za-z_][\w.-]*/);
    if (word) {
      nodes.push(
        <span
          key={i}
          className={KEYWORDS.has(word[0]) ? "text-sky-300" : "text-slate-200"}
        >
          {word[0]}
        </span>,
      );
      i += word[0].length;
      continue;
    }
    nodes.push(
      <span key={i} className="text-slate-400">
        {line[i]}
      </span>,
    );
    i += 1;
  }
  return nodes;
}

export function CodeBlock({ example }: { example: CodeSnippet }) {
  const lines = example.code.replace(/\n$/, "").split("\n");
  return (
    <div
      className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1018]"
      dir="ltr"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-xs font-medium text-slate-400">{example.title}</span>
        <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {example.language}
        </span>
      </div>
      <pre className="overflow-x-auto p-3 text-[12.5px] leading-relaxed">
        <code className="font-[family-name:var(--font-mono)]">
          {lines.map((line: string, idx: number) => (
            <div key={idx} className="whitespace-pre">
              <span className="me-3 inline-block w-5 select-none text-end text-slate-600">
                {idx + 1}
              </span>
              {highlightLine(line, example.language)}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
