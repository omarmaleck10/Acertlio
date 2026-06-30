import { History } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AlumnoHistorialPage() {
  return (
    <ComingSoonPanel
      icon={<History />}
      title="Historial de exámenes"
      description="Todos los simulacros que has hecho, con su puntuación, grado Cambridge, tiempo invertido y la corrección detallada de tu profesor en el Writing."
      features={[
        "Listado completo de mocks completados",
        "Revisar cada examen pregunta a pregunta",
        "Ver tus respuestas y la corrección oficial",
        "Comentarios del profesor en Writing",
        "Descargar el resultado en PDF",
      ]}
      phase="Fase 6"
    />
  );
}
