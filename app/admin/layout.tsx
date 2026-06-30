import type { Metadata } from "next";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  Music,
  CreditCard,
  FileWarning,
  BarChart3,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Panel admin",
  robots: { index: false, follow: false },
};

const items: SidebarItem[] = [
  { label: "Resumen", href: "/admin", icon: <LayoutDashboard /> },
  { label: "Academias", href: "/admin/academias", icon: <Building2 /> },
  { label: "Usuarios", href: "/admin/usuarios", icon: <Users /> },
  { label: "Exámenes", href: "/admin/examenes", icon: <BookOpen /> },
  { label: "Audios", href: "/admin/audios", icon: <Music /> },
  { label: "Pagos", href: "/admin/pagos", icon: <CreditCard /> },
  { label: "Audit logs", href: "/admin/logs", icon: <FileWarning /> },
  { label: "Métricas", href: "/admin/metricas", icon: <BarChart3 /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar role="Superadmin" userName="Equipo Acertlio" items={items} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
