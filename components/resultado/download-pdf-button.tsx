"use client";

import { Download } from "lucide-react";

interface Props {
  filenameHint?: string;
}

/**
 * Botón "Descargar PDF" que dispara el diálogo de impresión del navegador.
 * El usuario elige "Guardar como PDF" en el destino.
 *
 * Los estilos `@media print` (en app/globals.css o el layout de resultado)
 * se encargan de que la vista impresa sea limpia:
 *   · Sin sidebar
 *   · Sin botones
 *   · Fondo blanco
 *   · Colores adaptados a papel
 */
export function DownloadPdfButton({ filenameHint }: Props) {
  const handleClick = () => {
    // Cambiar título temporalmente para que el nombre del PDF sea razonable
    const previousTitle = document.title;
    if (filenameHint) {
      document.title = filenameHint;
    }

    try {
      window.print();
    } finally {
      // Restaurar título (con un pequeño delay porque algunos navegadores
      // toman el título justo después de abrir el diálogo)
      setTimeout(() => {
        document.title = previousTitle;
      }, 500);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="print:hidden inline-flex items-center gap-1.5 rounded border border-navy/30 bg-white text-navy hover:bg-navy hover:text-white transition-colors px-3 py-1.5 text-sm font-medium"
      aria-label="Descargar resultado en PDF"
    >
      <Download className="h-3.5 w-3.5" />
      Descargar PDF
    </button>
  );
}
