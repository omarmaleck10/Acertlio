import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/supabase/user";
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

export default async function ProfesorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const displayName = user.profile.full_name || user.email;

  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar role="Profesor" userName={displayName} items={items} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
