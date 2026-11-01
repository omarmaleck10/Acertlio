/**
 * Footer actualizado · Lote 1 Acertlio
 *
 * Cambios respecto al anterior:
 *  - Copyright: Omar Maleck como titular (no Marave Web Studio)
 *  - Marave aparece como "Desarrollado por"
 *  - Rutas legales corregidas a /legal/* (coinciden con la web actual)
 *  - Enlace a /legal/terminos añadido (antes no existía)
 *  - Botón "Configurar cookies" preparado para integrar con el banner
 *
 * Si ya tienes un Footer propio, aplica solo los cambios de este archivo
 * a tu componente actual.
 */

import Link from "next/link";
// Si tienes el componente del banner de cookies:
// import { CookieSettingsButton } from "@/components/cookies/CookieBanner";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Parte superior: logo + columnas */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Logo + eslogan */}
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">
                Acertl
                <span className="relative">
                  i
                  <span className="absolute left-0 -top-1 h-0.5 w-full bg-saffron"></span>
                </span>
                o
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Simulacros de preparación Cambridge Computer-Based con corrección
              IA del Writing. Para alumnos y academias.
            </p>
            <p className="mt-3 text-xs text-white/60">
              Plataforma independiente. No afiliada a Cambridge Assessment
              English.
            </p>
            <a
              href="mailto:hola@acertlio.com"
              className="mt-4 inline-block text-sm text-white/80 hover:text-saffron"
            >
              hola@acertlio.com
            </a>
          </div>

          {/* Producto */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-saffron">
              Producto
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/#producto" className="text-white/80 hover:text-white">Cómo funciona</Link></li>
              <li><Link href="/precios" className="text-white/80 hover:text-white">Precios</Link></li>
              <li><Link href="/academias" className="text-white/80 hover:text-white">Para academias</Link></li>
              <li><Link href="/correccion-writing-ia" className="text-white/80 hover:text-white">Corrección Writing IA</Link></li>
              <li><Link href="/examen-cambridge-computer-based" className="text-white/80 hover:text-white">Examen por ordenador</Link></li>
            </ul>
          </div>

          {/* Compañía */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-saffron">
              Compañía
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/blog" className="text-white/80 hover:text-white">Blog</Link></li>
              <li><Link href="/contacto" className="text-white/80 hover:text-white">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-saffron">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/legal/aviso" className="text-white/80 hover:text-white">Aviso legal</Link></li>
              <li><Link href="/legal/privacidad" className="text-white/80 hover:text-white">Privacidad</Link></li>
              <li><Link href="/legal/cookies" className="text-white/80 hover:text-white">Cookies</Link></li>
              <li><Link href="/legal/terminos" className="text-white/80 hover:text-white">Términos</Link></li>
              {/*
              <li>
                <CookieSettingsButton className="text-sm text-white/80 hover:text-white underline-offset-2 hover:underline" />
              </li>
              */}
            </ul>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/60">
              © {currentYear} Acertlio · Omar Maleck · NIF 29551393G · Sevilla,
              España. Todos los derechos reservados.
            </p>
            <p className="text-xs text-white/60">
              Desarrollado por{" "}
              <a
                href="https://maravewebstudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 underline-offset-2 hover:text-saffron hover:underline"
              >
                Marave Web Studio
              </a>
              {" "}· Hecho en España.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
