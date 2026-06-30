import { Ticket } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaLicenciasPage() {
  return (
    <ComingSoonPanel
      icon={<Ticket />}
      title="Licencias"
      description="Panel de control de las plazas concurrentes contratadas. Asígnalas a alumnos, libéralas cuando terminen el curso, y mira el histórico de uso."
      features={[
        "Plazas usadas / disponibles en tiempo real",
        "Asignar y liberar licencias",
        "Histórico completo de altas y bajas",
        "Alerta cuando te quedas sin plazas",
        "Subir o bajar de plan en un clic",
      ]}
      phase="Fase 3"
    />
  );
}
