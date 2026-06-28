import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #cc785c, #a85a3f)",
        }}
      >
        <svg viewBox="0 0 24 24" width="100" height="100" fill="white">
          <path d="M12 2C7.6 2 4 5.6 4 10c0 5.5 7 12 7 12s7-6.5 7-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
