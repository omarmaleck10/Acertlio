import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const cols = [
  {
    title: "Producto",
    items: [
      { label: "Cómo funciona", href: "/#producto" },
      { label: "Precios", href: "/precios" },
      { label: "Para academias", href: "/academias" },
    ],
  },
  {
    title: "Compañía",
    items: [
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Aviso legal", href: "/legal/aviso" },
      { label: "Privacidad", href: "/legal/privacidad" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="max-w-site mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted max-w-xs">
              Simulacros Cambridge Computer-Based para academias de inglés.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-wider text-muted mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-ink hover:text-navy transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-rule flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <p>© {new Date().getFullYear()} Acertlio. Todos los derechos reservados.</p>
          <p>Hecho en España.</p>
        </div>
      </div>
    </footer>
  );
}
