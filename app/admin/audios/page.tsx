import { Music } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminAudiosPage() {
  return (
    <ComingSoonPanel
      icon={<Music />}
      title="Audios de Listening"
      description="Biblioteca de audios protegidos para Listening. Sube los archivos, define duración y número de reproducciones permitidas."
      features={[
        "Subida de audios MP3 / WAV",
        "URLs firmadas con caducidad (no descargables)",
        "Definir reproducciones máximas por audio",
        "Etiquetar por nivel y parte",
        "Vista previa con reproductor protegido",
      ]}
      phase="Fase 5"
    />
  );
}
