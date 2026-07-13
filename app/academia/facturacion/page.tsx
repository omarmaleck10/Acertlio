import { Receipt } from "lucide-react";

export default function AcademiaFacturacionPage() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Facturación</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Pagos y facturas
        </h1>
      </header>
      <div className="rounded border border-saffron/30 bg-saffron/5 p-8 text-center">
        <Receipt className="h-10 w-10 text-saffron mx-auto mb-4 opacity-70" />
        <p className="text-sm text-ink font-medium mb-2">Próximamente</p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Aún no estamos cobrando. Cuando activemos los pagos con Stripe podrás
          gestionar aquí tu suscripción, método de pago y descargar facturas.
        </p>
        <p className="text-xs text-muted mt-4">
          Mientras tanto, tu academia está en <strong>periodo de prueba</strong> sin
          cargos.
        </p>
      </div>
    </div>
  );
}
