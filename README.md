# Acertlio

Plataforma SaaS de simulacros Cambridge Computer-Based para academias de inglés (B1, B2, C1).

Esta versión es la **preview visual deployable**: todas las páginas funcionan, los 4 dashboards muestran datos mock, y el simulador tiene un preview navegable. Sin conexión a base de datos ni pagos reales todavía — eso entra en las siguientes fases.

---

## Cómo desplegar esto en internet (paso a paso, sin saber programar)

### Paso 1 — Subir el código a GitHub

1. Entra en [github.com](https://github.com) y crea cuenta si no tienes (con el mismo email que vayas a usar siempre para este proyecto).
2. En la esquina superior derecha, pulsa el botón "+" → **New repository**.
3. Rellena:
   - **Repository name:** `acertlio`
   - **Description:** Plataforma de simulacros Cambridge
   - **Private** (marca esta opción — tu código no debe ser público)
   - **NO** marques "Add a README" ni "Add a .gitignore" (ya vienen en el ZIP)
4. Pulsa **Create repository**.
5. En la siguiente pantalla verás unas opciones. Pulsa el enlace **"uploading an existing file"** (está en mitad de la página, en gris).
6. Arrastra **todos los archivos y carpetas** del ZIP que te di (descomprímelo antes). No subas la carpeta `acertlio` en sí, sino su contenido.
7. Espera a que termine la subida (puede tardar unos segundos).
8. Abajo del todo, en "Commit changes", pulsa **Commit changes**.

Listo, tienes el código en GitHub.

### Paso 2 — Desplegar en Vercel

1. Entra en [vercel.com](https://vercel.com) y pulsa **Sign Up**.
2. Elige **Continue with GitHub**. Autoriza el acceso.
3. Una vez dentro, pulsa **Add New...** → **Project**.
4. En la lista de repositorios verás `acertlio`. Pulsa **Import**.
5. Vercel detectará automáticamente que es un proyecto Next.js. **No cambies nada de la configuración por defecto.**
6. Pulsa **Deploy**.
7. Espera 1–2 minutos. Te dará una URL del tipo `acertlio-xxx.vercel.app`.

Ya está en internet. Abre la URL y verás Acertlio funcionando.

### Paso 3 — (Más adelante) Conectar tu dominio

Cuando tengas `acertlio.com` listo:

1. En Vercel, entra en el proyecto → **Settings** → **Domains**.
2. Escribe `acertlio.com` y pulsa **Add**.
3. Vercel te dará 2–4 registros DNS para añadir en Namecheap.
4. En Namecheap, ve al panel del dominio → **Manage** → **Advanced DNS** y pega los registros que te dio Vercel.
5. Espera 10–30 minutos a que los DNS propaguen.

---

## Estructura del proyecto

```
acertlio/
├── app/                    # Páginas (Next.js App Router)
│   ├── page.tsx            # Home /
│   ├── precios/            # /precios
│   ├── academias/          # /academias
│   ├── contacto/           # /contacto
│   ├── legal/              # /legal/*
│   ├── login/              # /login
│   ├── academia/           # Dashboard academia
│   ├── profesor/           # Dashboard profesor
│   ├── alumno/             # Dashboard alumno + simulador
│   └── admin/              # Dashboard superadmin
├── components/             # Componentes reutilizables
│   ├── ui/                 # Botón, Card, Input
│   ├── marketing/          # Header, Footer, Hero, ExamPreview
│   ├── dashboard/          # Sidebar, StatCard
│   └── shared/             # Logo
├── lib/                    # Utilidades
└── public/                 # Favicon, assets estáticos
```

## Stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript** estricto
- **Tailwind CSS** con paleta personalizada de Acertlio
- **lucide-react** para iconografía
- Fuentes de Google: Inter, Instrument Serif, JetBrains Mono

## Paleta de Acertlio

| Token | Hex | Uso |
|---|---|---|
| `ink` | `#0A0E1A` | Texto principal |
| `paper` | `#FAFAF7` | Fondo secundario |
| `rule` | `#E7E5E0` | Bordes y divisores |
| `muted` | `#6B7280` | Texto secundario |
| `navy` | `#0B1F4F` | Color primario |
| `navy-600` | `#1E3A8A` | Acciones secundarias |
| `saffron` | `#C5894A` | Acento (único color signature) |

## Próximos pasos (fuera de esta preview)

- [ ] Fase 2: Auth real con Supabase + roles
- [ ] Fase 3: Stripe + sistema de licencias concurrentes
- [ ] Fase 4: Constructor de exámenes en /admin
- [ ] Fase 5: Simulador funcional con autosave
- [ ] Fase 6: Corrección automática + manual
- [ ] Fase 7: Pulido, accesibilidad, GDPR
- [ ] Fase 8: Producción

---

© Acertlio — Todos los derechos reservados.
