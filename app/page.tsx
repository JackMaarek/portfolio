import { JsonLd } from "./json-ld";
import { Portfolio } from "./portfolio";
import { personJsonLd } from "./structured-data";

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd} />
      <Portfolio />
    </>
  );
}
