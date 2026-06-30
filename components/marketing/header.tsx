import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const nav = [
  { label: "Producto", href: "/#producto" },
  { label: "Precios", href: "/precios" },
  { label: "Para academias", href: "/academias" },
  { label: "Contacto", href: "/contacto" },
];

export function MarketingHeader() {
  return (
    <header className="border-b border-rule bg-white">
      <div className="max-w-site mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Inicio Acertlio">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Iniciar sesión</Button>
          </Link>
          <Link href="/empezar" className="hidden sm:inline-flex">
            <Button size="sm">Empezar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
