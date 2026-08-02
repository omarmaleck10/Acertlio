"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error boundary con detalles visibles del error.
 *
 * En producción, React muestra "Application error: a client-side exception".
 * Este boundary intercepta ese error y lo muestra en pantalla con detalles
 * suficientes para diagnosticar sin necesidad de reproducir en dev.
 *
 * Útil especialmente para bugs de tipo "objeto renderizado como React child"
 * (React error #31) donde el mensaje minificado no da pistas.
 */
export class DebugErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("[DebugErrorBoundary]", error, errorInfo);
    this.setState({
      errorInfo: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border-2 border-error/40 bg-error/5 p-6 my-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-error flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-error mb-2">
                Se ha producido un error al renderizar
                {this.props.label ? ` (${this.props.label})` : ""}
              </h3>
              <p className="text-sm text-ink mb-3">
                Este error impide mostrar el contenido. Mándame captura de
                esta pantalla completa.
              </p>

              <details className="text-xs" open>
                <summary className="cursor-pointer font-medium text-ink mb-2">
                  Detalles técnicos
                </summary>
                <div className="space-y-3 mt-2">
                  <div>
                    <p className="font-semibold text-ink mb-1">
                      Mensaje del error:
                    </p>
                    <pre className="bg-white border border-rule rounded p-2 text-xs overflow-auto whitespace-pre-wrap break-words">
                      {this.state.error?.message ?? "Sin mensaje"}
                    </pre>
                  </div>

                  {this.state.error?.stack && (
                    <div>
                      <p className="font-semibold text-ink mb-1">Stack:</p>
                      <pre className="bg-white border border-rule rounded p-2 text-xs overflow-auto whitespace-pre-wrap break-words max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo && (
                    <div>
                      <p className="font-semibold text-ink mb-1">
                        Component stack:
                      </p>
                      <pre className="bg-white border border-rule rounded p-2 text-xs overflow-auto whitespace-pre-wrap break-words max-h-40">
                        {this.state.errorInfo}
                      </pre>
                    </div>
                  )}
                </div>
              </details>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-1.5 rounded bg-navy text-white px-4 py-2 text-sm font-medium hover:bg-navy/90 transition-colors"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
