import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/constants";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(255,248,240,1) 0%, rgba(255,233,239,1) 48%, rgba(229,246,255,1) 100%)",
          padding: "56px",
          color: "#25304a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: 40,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(255,255,255,0.9)",
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 8,
            }}
          >
            Cute editorial archive
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                fontSize: 92,
                lineHeight: 0.92,
                fontWeight: 900,
              }}
            >
              {SITE_NAME}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.4,
                maxWidth: 820,
                color: "#4b5878",
              }}
            >
              Mobile, desktop và GIF Chiikawa với tốc độ tải nhanh, moderation flow rõ ràng và file gốc chất lượng cao.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
            }}
          >
            {["Mobile", "Desktop", "GIF", "Contribution"].map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: 999,
                  background: "white",
                  padding: "12px 22px",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
