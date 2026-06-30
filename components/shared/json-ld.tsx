/**
 * Inyecta JSON-LD structured data en el HTML.
 * Lo lee Google y otros crawlers para entender mejor la naturaleza del sitio.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
