import { BookOpen } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminExamenesPage() {
  return (
    <ComingSoonPanel
      icon={<BookOpen />}
      title="Constructor de exámenes"
      description="Crea y edita los mocks de Cambridge. Define partes, preguntas, opciones, claves de respuesta y rúbricas de Writing."
      features={[
        "Editor por partes (Reading, UoE, Listening, Writing)",
        "Importar preguntas desde plantilla CSV",
        "Definir claves de respuesta",
        "Asignar audios a Listening con control de reproducciones",
        "Versionar y publicar mocks por nivel",
      ]}
      phase="Fase 4"
    />
  );
}
