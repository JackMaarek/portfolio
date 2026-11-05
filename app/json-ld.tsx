type JsonLdProps = {
  data: Record<string, unknown>;
};

const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

// JSON.stringify does not escape "<", so a value containing "</script>" would
// close the tag and allow script injection. Escape every character that can
// break out of a script element or be misparsed as a line terminator.
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // Safe: input is static site data and the serializer escapes markup.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
