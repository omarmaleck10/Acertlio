import { FileText } from "lucide-react";

export default function ProfesorWritingPage() {
  return (
    <div className="px-8 py-8 max-w-3xl">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted">Writings</p>
        <h1 className="font-semibold text-3xl text-ink tracking-tight mt-1">
          Writings pendientes
        </h1>
      </header>
      <div className="rounded border border-saffron/30 bg-saffron/5 p-8 text-center">
        <FileText className="h-10 w-10 text-saffron mx-auto mb-4 opacity-70" />
        <p className="text-sm text-ink font-medium mb-2">Próximamente</p>
        <p className="text-sm text-muted max-w-md mx-auto">
          Aquí verás los writings de tus alumnos con la rúbrica Cambridge oficial:
          Content, Communicative Achievement, Organisation y Language. Cada uno
          de 0 a 5.
        </p>
      </div>
    </div>
  );
}
