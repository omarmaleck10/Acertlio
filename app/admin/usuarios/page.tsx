import { Users } from "lucide-react";
import { ComingSoonPanel } from "@/components/dashboard/coming-soon";

export default function AdminUsuariosPage() {
  return (
    <ComingSoonPanel
      icon={<Users />}
      title="Usuarios de la plataforma"
      description="Buscador global de usuarios (academias, profesores, alumnos). Útil para soporte cuando alguien escribe con un problema."
      features={[
        "Buscar por email, nombre o ID",
        "Ver a qué academia pertenece cada usuario",
        "Resetear contraseña como soporte",
        "Bloquear o desbloquear cuentas",
        "Histórico de sesiones e IPs",
      ]}
      phase="Fase 7"
    />
  );
}
