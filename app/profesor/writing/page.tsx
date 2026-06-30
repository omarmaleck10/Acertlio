import { FileText } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function ProfesorWritingPage() {
  return (
    <ComingSoonPanel
      icon={<FileText />}
      title="Writings pendientes de corrección"
      description="Cola de redacciones por corregir. Editor con rúbrica Cambridge integrada, comentarios por párrafo y puntuación por criterio."
      features={[
        "Cola priorizada por fecha de entrega",
        "Editor con rúbrica Cambridge integrada",
        "Comentarios in-line por párrafo",
        "Puntuación por criterio (Content, Communicative Achievement, Organisation, Language)",
        "Plantillas de feedback reutilizables",
      ]}
      phase="Fase 6"
    />
  );
}
