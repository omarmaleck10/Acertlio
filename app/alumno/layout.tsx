import type { Metadata } from "next";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import { LayoutDashboard, BookOpenCheck, History, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel alumno",
  robots: { index: false, follow: false },
};

const items: SidebarItem[] = [
  { label: "Resumen", href: "/alumno", icon: <LayoutDashboard /> },
  { label: "Simulacros", href: "/alumno/simulacros", icon: <BookOpenCheck /> },
  { label: "Historial", href: "/alumno/historial", icon: <History /> },
  { label: "Progreso", href: "/alumno/progreso", icon: <BarChart3 /> },
];

export default function AlumnoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar role="Alumno" userName="Lucía Romero" items={items} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
