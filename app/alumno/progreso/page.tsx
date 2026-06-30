import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AlumnoProgresoPage() {
  return (
    <ComingSoonPanel
      icon={<BarChart3 />}
      title="Tu progreso"
      description="Visualiza cómo evolucionas a lo largo del curso: tu media por parte, los errores más frecuentes que cometes, y la nota estimada que sacarías hoy en el examen oficial."
      features={[
        "Gráfica de evolución mock a mock",
        "Media de aciertos por parte (Reading, UoE, Listening, Writing)",
        "Errores más frecuentes detectados",
        "Nota estimada en el examen oficial",
        "Comparación con la media de tu nivel",
      ]}
      phase="Fase 6"
    />
  );
}
