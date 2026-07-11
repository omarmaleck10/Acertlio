import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/supabase/user";
import {
  LayoutDashboard,
  Ticket,
  GraduationCap,
  Users,
  BarChart3,
  Receipt,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Panel academia",
  robots: { index: false, follow: false },
};

const items: SidebarItem[] = [
  { label: "Resumen", href: "/academia", icon: <LayoutDashboard /> },
  { label: "Licencias", href: "/academia/licencias", icon: <Ticket /> },
  { label: "Profesores", href: "/academia/profesores", icon: <Users /> },
  { label: "Alumnos", href: "/academia/alumnos", icon: <GraduationCap /> },
  { label: "Estadísticas", href: "/academia/estadisticas", icon: <BarChart3 /> },
  { label: "Facturación", href: "/academia/facturacion", icon: <Receipt /> },
  { label: "Configuración", href: "/academia/configuracion", icon: <Settings /> },
];

export default async function AcademiaLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Cargar el nombre de la academia (respetando RLS)
  const displayName = user.profile.full_name || user.email;

  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar
        role="Academia"
        userName={displayName}
        items={items}
      />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
