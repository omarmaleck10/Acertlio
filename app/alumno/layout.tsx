import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar, SidebarItem } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/lib/supabase/user";
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

export default async function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const displayName = user.profile.full_name || user.email;

  return (
    <div className="flex bg-paper min-h-screen">
      <DashboardSidebar role="Alumno" userName={displayName} items={items} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
