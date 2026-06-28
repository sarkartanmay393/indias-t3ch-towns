import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0eee6",
          color: "#1f1e1d",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="#cc785c">
            <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 7 12s7-6.5 7-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
          </svg>
          <div style={{ fontSize: 72, fontWeight: 700 }}>TechCities</div>
        </div>
        <div style={{ fontSize: 30, marginTop: 24, color: "#52514a" }}>
          Tech company offices across India&apos;s biggest cities, on a map
        </div>
        <div style={{ fontSize: 24, marginTop: 36, color: "#cc785c" }}>Pune · Bengaluru · Delhi · Kolkata · Mumbai</div>
      </div>
    ),
    { ...size }
  );
}
