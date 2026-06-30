import { Settings } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaConfiguracionPage() {
  return (
    <ComingSoonPanel
      icon={<Settings />}
      title="Configuración de la academia"
      description="Datos de tu academia, logo, política de contraseñas, integraciones con tu CRM o software de gestión."
      features={[
        "Datos fiscales y de facturación",
        "Logo y personalización visual",
        "Política de contraseñas para alumnos",
        "Integración con Classin, Phorms, Lexlive, etc.",
        "Doble factor obligatorio para profesores",
      ]}
      phase="Fase 7"
    />
  );
}
