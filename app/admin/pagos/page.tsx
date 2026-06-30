import { CreditCard } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminPagosPage() {
  return (
    <ComingSoonPanel
      icon={<CreditCard />}
      title="Pagos"
      description="Histórico de pagos de todas las academias, integrado con Stripe. MRR, ARR, churn y revenue por plan."
      features={[
        "Conexión directa con Stripe",
        "Histórico de transacciones",
        "MRR / ARR en tiempo real",
        "Churn rate y motivos de baja",
        "Pagos pendientes y reintentos",
      ]}
      phase="Fase 3"
    />
  );
}
