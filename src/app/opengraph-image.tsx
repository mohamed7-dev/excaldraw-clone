import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#ffffff",
          color: "#0b0b12",
          padding: 48,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1000px 400px at -10% -20%, rgba(99,102,241,0.08), transparent), radial-gradient(800px 300px at 110% 120%, rgba(5,150,105,0.08), transparent)",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, oklch(0.488 0.243 264.376) 0%, oklch(0.208 0.042 265.755) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 40,
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            }}
          >
            ✏️
          </div>
          <span>Excaldraw Clone</span>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#4b5563",
          }}
        >
          Lightweight canvas editor powered by Fabric.js
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
