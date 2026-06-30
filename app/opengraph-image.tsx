import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Acertlio — Simulacros Cambridge Computer-Based para academias";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#FAFAF7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: logo */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 56,
            fontWeight: 700,
            color: "#0B1F4F",
            letterSpacing: "-0.02em",
          }}
        >
          <span>Acertl</span>
          <div style={{ position: "relative", display: "flex" }}>
            <span>ı</span>
            <div
              style={{
                position: "absolute",
                top: -22,
                left: "50%",
                width: 10,
                height: 18,
                background: "#C5894A",
                transform: "translateX(-30%) rotate(20deg)",
                borderRadius: 2,
              }}
            />
          </div>
          <span>o</span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <div
            style={{
              fontSize: 24,
              color: "#C5894A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 20,
              display: "flex",
            }}
          >
            Cambridge Computer-Based · B1 · B2 · C1
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#0A0E1A",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              display: "flex",
              flexWrap: "wrap",
              maxWidth: 1000,
            }}
          >
            Simulacros Cambridge para academias de inglés.
          </div>
        </div>

        {/* Bottom: tagline + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #E7E5E0",
            paddingTop: 24,
          }}
        >
          <div style={{ fontSize: 24, color: "#6B7280", display: "flex" }}>
            Misma interfaz. Mismos tiempos. Mismas reglas que el examen real.
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#0B1F4F",
              fontWeight: 600,
              display: "flex",
            }}
          >
            acertlio.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
