import { GraduationCap } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaAlumnosPage() {
  return (
    <ComingSoonPanel
      icon={<GraduationCap />}
      title="Alumnos"
      description="Listado completo de alumnos de tu academia. Invítalos, organízalos por grupos y nivel, archiva los que ya han acabado para liberar su plaza."
      features={[
        "Invitar alumnos individualmente o por CSV",
        "Organizar por grupos y nivel Cambridge",
        "Archivar alumnos para liberar su licencia",
        "Buscar y filtrar por estado",
        "Asignar profesor responsable",
      ]}
      phase="Fase 4"
    />
  );
}
