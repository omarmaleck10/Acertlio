import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Solicita una demo en directo de Acertlio o cuéntanos sobre tu academia. Respondemos en menos de 24 horas en días laborables.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoPage() {
  return (
    <>
      <MarketingHeader />

      <main className="border-b border-rule">
        <section className="max-w-site mx-auto px-6 py-20 grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-wider text-saffron mb-3">Contacto</p>
            <h1 className="font-semibold text-5xl text-ink tracking-tight leading-[1.05]">
              Cuéntanos sobre tu academia.
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed">
              Respondemos en menos de 24 horas en días laborables. Si quieres demo, dinos cuántos alumnos preparáis Cambridge al año.
            </p>
            <div className="mt-10 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-muted">
                <Mail className="h-4 w-4" />
                <span>hola@acertlio.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <MapPin className="h-4 w-4" />
                <span>España</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form className="rounded border border-rule bg-white p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div>
                  <Label htmlFor="academy">Academia</Label>
                  <Input id="academy" placeholder="Nombre de la academia" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="tu@academia.com" />
              </div>

              <div>
                <Label htmlFor="size">¿Cuántos alumnos preparáis Cambridge al año?</Label>
                <select
                  id="size"
                  className="h-10 w-full rounded border border-rule bg-white px-3 text-sm text-ink focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                >
                  <option>Menos de 30</option>
                  <option>30–80</option>
                  <option>80–200</option>
                  <option>Más de 200</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message">Mensaje</Label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Cuéntanos qué buscas..."
                  className="w-full rounded border border-rule bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <p className="text-xs text-muted">
                  Al enviar aceptas nuestra política de privacidad.
                </p>
                <Button type="button">Enviar mensaje</Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
