import { Building2 } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminAcademiasPage() {
  return (
    <ComingSoonPanel
      icon={<Building2 />}
      title="Academias"
      description="Visión global de todas las academias suscritas: estado, plan contratado, uso de licencias, MRR aportado y soporte abierto."
      features={[
        "Listado completo con buscador",
        "Detalle de cada academia y su uso",
        "Cambiar plan, pausar o cancelar",
        "Acceso de soporte (impersonar con auditoría)",
        "Histórico de cambios de cada cuenta",
      ]}
      phase="Fase 7"
    />
  );
}
