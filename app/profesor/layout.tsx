import type { Metadata } from "next";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import { LayoutDashboard, Users, ClipboardCheck, FileText, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel profesor",
  robots: { index: false, follow: false },
};

const items: SidebarItem[] = [
  { label: "Resumen", href: "/profesor", icon: <LayoutDashboard /> },
  { label: "Alumnos", href: "/profesor/alumnos", icon: <Users /> },
  { label: "Simulacros", href: "/profesor/simulacros", icon: <ClipboardCheck /> },
  { label: "Writings pendientes", href: "/profesor/writing", icon: <FileText /> },
  { label: "Estadísticas", href: "/profesor/estadisticas", icon: <BarChart3 /> },
];

export default function ProfesorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar role="Profesor" userName="Helen Watson" items={items} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
