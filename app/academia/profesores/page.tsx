import { Users } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaProfesoresPage() {
  return (
    <ComingSoonPanel
      icon={<Users />}
      title="Profesores"
      description="Gestiona los profesores de tu academia: invítalos, asígnales grupos de alumnos y define qué permisos tienen."
      features={[
        "Invitar profesores por email",
        "Asignar grupos de alumnos a cada profesor",
        "Permisos personalizables (corregir, crear contenido)",
        "Profesores ilimitados en todos los planes",
        "Métricas individuales de cada profesor",
      ]}
      phase="Fase 4"
    />
  );
}
