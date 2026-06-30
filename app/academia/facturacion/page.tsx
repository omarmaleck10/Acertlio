import { Receipt } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AcademiaFacturacionPage() {
  return (
    <ComingSoonPanel
      icon={<Receipt />}
      title="Facturación"
      description="Todas tus facturas en un sitio. Cambia de plan, actualiza método de pago, descarga facturas para tu asesor."
      features={[
        "Facturas mensuales o anuales con tu CIF",
        "Descargar todas en PDF",
        "Actualizar método de pago",
        "Cambiar de plan (subir/bajar)",
        "Histórico de pagos completo",
      ]}
      phase="Fase 3"
    />
  );
}
