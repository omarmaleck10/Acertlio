import { Users } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function ProfesorAlumnosPage() {
  return (
    <ComingSoonPanel
      icon={<Users />}
      title="Tus alumnos"
      description="Ficha completa de cada alumno asignado: su nivel, mocks completados, evolución, próximas asignaciones y notas que les hayas dejado."
      features={[
        "Ficha individual por alumno",
        "Filtros por nivel y grupo",
        "Marcar alumnos en riesgo de no aprobar",
        "Asignar simulacros directamente desde la ficha",
        "Notas privadas del profesor por alumno",
      ]}
      phase="Fase 4"
    />
  );
}
