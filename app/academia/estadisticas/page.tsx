import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaEstadisticasPage() {
  return (
    <ComingSoonPanel
      icon={<BarChart3 />}
      title="Estadísticas de la academia"
      description="Vista panorámica del rendimiento de toda tu academia: tasa de aprobados estimada, evolución por niveles, comparativa entre profesores y grupos."
      features={[
        "Tasa de aprobados estimada global",
        "Comparativa por nivel (B1, B2, C1)",
        "Comparativa entre profesores",
        "Evolución mes a mes",
        "Exportar informe en PDF para socios",
      ]}
      phase="Fase 6"
    />
  );
}
