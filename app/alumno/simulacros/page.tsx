import { BookOpenCheck } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AlumnoSimulacrosPage() {
  return (
    <ComingSoonPanel
      icon={<BookOpenCheck />}
      title="Simulacros disponibles"
      description="Aquí verás los mocks que tu profesor te ha asignado, con su nivel, partes incluidas y tiempo estimado. Podrás empezar uno nuevo o continuar uno ya iniciado."
      features={[
        "Simulacros asignados por tu profesor",
        "Continuar exámenes que dejaste a medias (autoguardado)",
        "Filtrar por nivel: B1, B2 o C1",
        "Ver cuántas partes lleva cada uno",
      ]}
      phase="Fase 5"
    />
  );
}
