import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empezar con Acertlio",
  description:
    "Empieza con Acertlio. Te llevamos al plan que mejor encaja según el tamaño de tu academia o tu uso individual.",
  alternates: { canonical: "/empezar" },
};

export default function EmpezarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
