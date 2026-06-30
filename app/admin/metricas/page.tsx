import { BarChart3 } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminMetricasPage() {
  return (
    <ComingSoonPanel
      icon={<BarChart3 />}
      title="Métricas de plataforma"
      description="Salud del producto: usuarios activos, simulacros completados, tasa de aprobados global, NPS y métricas técnicas."
      features={[
        "DAU / MAU por rol",
        "Simulacros completados por nivel",
        "Tasa de aprobados estimada global",
        "Tiempo medio de corrección de Writing",
        "Métricas técnicas: latencia, errores, uptime",
      ]}
      phase="Fase 7"
    />
  );
}
