// A line of copy with its accent part set in a span.
export function Accent({ text, accent }: { text: string; accent: string }) {
  const at = text.indexOf(accent);
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span>{accent}</span>
      {text.slice(at + accent.length)}
    </>
  );
}
