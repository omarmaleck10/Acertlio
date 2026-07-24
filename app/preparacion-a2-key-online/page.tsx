import type { Metadata } from "next";
import { LevelLandingPage } from "@/components/marketing/level-landing";
import { LEVEL_LANDINGS } from "@/lib/level-landings";
import { JsonLd } from "@/components/shared/json-ld";

const config = LEVEL_LANDINGS.a2;

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
  alternates: { canonical: `/${config.slug}` },
  openGraph: {
    title: config.metaTitle,
    description: config.metaDescription,
    url: `/${config.slug}`,
  },
};

export default function Page() {
  return (
    <>
      <LevelLandingPage config={config} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: `Preparación ${config.levelFull}`,
          description: config.metaDescription,
          provider: {
            "@type": "Organization",
            name: "Acertlio",
            sameAs: "https://acertlio.com",
          },
          educationalLevel: config.cefrLevel,
        }}
      />
    </>
  );
}
