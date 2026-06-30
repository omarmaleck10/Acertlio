import { ClipboardCheck } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function ProfesorSimulacrosPage() {
  return (
    <ComingSoonPanel
      icon={<ClipboardCheck />}
      title="Asignar simulacros"
      description="Asigna mocks a tus alumnos: individualmente, a un grupo entero o por nivel. Define fecha límite y partes a incluir."
      features={[
        "Catálogo completo de mocks B1, B2 y C1",
        "Asignar a alumno, grupo o nivel completo",
        "Personalizar partes incluidas",
        "Fecha límite y aviso automático",
        "Ver quién ha hecho qué",
      ]}
      phase="Fase 4"
    />
  );
}
