import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function ProfesorEstadisticasPage() {
  return (
    <ComingSoonPanel
      icon={<BarChart3 />}
      title="Estadísticas de tus alumnos"
      description="Visión agregada del rendimiento de tus alumnos: tasa de aprobados estimada, áreas que dominan el grupo, áreas en las que tienes que insistir más."
      features={[
        "Tasa de aprobados estimada por grupo",
        "Heatmap de errores por tipo de pregunta",
        "Partes en las que tu grupo va bien o mal",
        "Comparativa entre tus grupos",
        "Tiempo medio invertido por examen",
      ]}
      phase="Fase 6"
    />
  );
}
