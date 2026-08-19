import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Track sprints and time without the busywork";
const SUBCAPTION = "Sprint planning + time tracking, in one place.";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundImage: "linear-gradient(135deg, #6d5efc 0%, #4b3ee0 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="#ffffff">
              <path d="M6 5 L26 5 L26 11 L14 11 L14 19 L6 19 Z" />
              <rect x="6" y="13" width="20" height="6" />
              <path d="M26 13 L26 27 L6 27 L6 21 L18 21 L18 13 Z" />
            </svg>
          </div>
          <span style={{ fontSize: "30px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
            Sprintly
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "56px",
            fontSize: "62px",
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            maxWidth: "920px",
          }}
        >
          {HEADLINE}
        </div>

        <div style={{ display: "flex", marginTop: "26px", fontSize: "28px", color: "rgba(255,255,255,0.82)" }}>
          {SUBCAPTION}
        </div>
      </div>
    ),
    size,
  );
}
