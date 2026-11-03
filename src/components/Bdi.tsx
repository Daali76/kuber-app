/** Wrap Latin / LTR runs for correct bidi in Persian prose. */
export function Bdi({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi className={className} dir="ltr">
      {children}
    </bdi>
  );
}

/** Split mixed FA/EN text and wrap Latin runs in <bdi>. */
export function BidiText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/([A-Za-z][A-Za-z0-9./:_-]*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^[A-Za-z]/.test(part) ? (
          <bdi key={i} dir="ltr">
            {part}
          </bdi>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}
