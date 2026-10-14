// The site's arrow, drawn rather than typed so it can be animated. It
// inherits the text colour and scales with the label.
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="1.15em"
      height="1em"
      viewBox="0 0 18 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.5 8h14" />
      <path d="M9.5 2l6 6-6 6" />
    </svg>
  );
}
