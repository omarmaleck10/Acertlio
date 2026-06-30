import { FileWarning } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminLogsPage() {
  return (
    <ComingSoonPanel
      icon={<FileWarning />}
      title="Audit logs"
      description="Registro completo de acciones sensibles en la plataforma. Útil para depurar problemas, auditorías legales o detectar comportamientos sospechosos."
      features={[
        "Cambios de plan y facturación",
        "Acciones de impersonación de soporte",
        "Intentos de login fallidos",
        "Modificación de exámenes y respuestas",
        "Exportación para auditoría legal (RGPD)",
      ]}
      phase="Fase 7"
    />
  );
}
