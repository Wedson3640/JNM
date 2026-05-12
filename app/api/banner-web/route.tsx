import { ImageResponse } from "next/og";

export const runtime = "edge";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const LOGO_JNM = `${BASE_URL}/images/logo%20JNM%20(1).png`;
const LOGO_UEPI = `${BASE_URL}/images/UEPI.png`;

function titleCase(s: string) {
  return s.split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "")).join(" ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const speaker = searchParams.get("speaker") ?? "";
  const theme = titleCase(searchParams.get("theme") ?? "");
  const date = searchParams.get("date") ?? "";
  const weekday = searchParams.get("weekday") ?? "";
  const time = searchParams.get("time") ?? "";
  const platforms = searchParams.get("platforms") ?? "YouTube";
  const photo = searchParams.get("photo") ?? "";

  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube" || platforms === "Ambos";

  const [fontBold, fontExtraBold] = await Promise.all([
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-ExtraBold.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
  ]);

  type FontWeight = 700 | 800;
  const fonts: { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" }[] = [];
  if (fontBold) fonts.push({ name: "Poppins", data: fontBold, weight: 700, style: "normal" });
  if (fontExtraBold) fonts.push({ name: "Poppins", data: fontExtraBold, weight: 800, style: "normal" });

  const fontFamily = fonts.length ? "Poppins" : "sans-serif";
  const speakerSize = speaker.length > 28 ? 46 : 58;
  const themeSize = theme.length > 36 ? 28 : theme.length > 22 ? 32 : 38;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 40%, #fdf4ff 70%, #fff7ed 100%)",
          fontFamily,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 18, left: 28, display: "flex", flexWrap: "wrap", width: 78, gap: 8, opacity: 0.24 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed" }} />
          ))}
        </div>

        <div style={{ position: "absolute", left: -90, top: 40, width: 430, height: 430, borderRadius: "50%", background: "rgba(167,139,250,0.42)" }} />
        <div style={{ position: "absolute", left: -44, top: 74, width: 360, height: 360, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.96)" }} />
        <div style={{ position: "absolute", left: -25, top: 92, width: 326, height: 326, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.58)" }} />
        <div style={{ position: "absolute", right: -80, top: 0, width: 220, height: 500, borderTopLeftRadius: 150, borderBottomLeftRadius: 150, background: "rgba(168,85,247,0.08)" }} />
        <div style={{ position: "absolute", left: 430, top: -110, width: 4, height: 380, background: "rgba(255,255,255,0.85)", transform: "rotate(28deg)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 390, paddingLeft: 34, paddingBottom: 82, flexShrink: 0, position: "relative" }}>
          {photo ? (
            <img
              src={photo}
              width={300}
              height={300}
              style={{ borderRadius: "50%", border: "8px solid white", objectFit: "cover", objectPosition: "top" }}
            />
          ) : (
            <div style={{ width: 300, height: 300, borderRadius: "50%", border: "8px solid white", background: "#e9d5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 66, fontWeight: 800, color: "#7c3aed" }}>
              JNM
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "34px 62px 104px 18px", gap: 12, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showFb && (
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 40, height: 40, borderRadius: 7, background: "#1d4ed8", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800 }}>f</div>
                <div style={{ borderRadius: 7, background: "#ef2929", color: "white", padding: "7px 13px", fontSize: 23, fontWeight: 800 }}>LIVE</div>
              </div>
            )}
            {showFb && showYt && <div style={{ width: 1, height: 38, background: "#c4b5fd" }} />}
            {showYt && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 52, height: 34, borderRadius: 9, background: "#ff0000", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>▶</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>YouTube</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 58, height: 2, background: "#a78bfa" }} />
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "8px", color: "#111827" }}>PALESTRANTE</div>
            <div style={{ width: 100, height: 2, background: "#a78bfa" }} />
          </div>

          <div style={{ fontSize: speakerSize, fontWeight: 800, color: "#2a0d4f", lineHeight: 1, maxWidth: 610 }}>
            {speaker}
          </div>

          <div style={{ display: "flex", gap: 18, marginTop: 2 }}>
            <div style={{ width: 4, background: "#f97316", borderRadius: 4 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 560 }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "6px", color: "#8b5cf6" }}>TEMA</div>
              <div style={{ fontSize: themeSize, fontWeight: 800, color: "#312e81", lineHeight: 1.12 }}>{theme}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.75)", border: "1.5px solid #e9d5ff", borderRadius: 18, padding: "10px 18px", fontSize: 20, fontWeight: 800, color: "#111827" }}>
              <span style={{ color: "#a855f7" }}>□</span>
              {date} {weekday ? `(${weekday})` : ""}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.75)", border: "1.5px solid #e9d5ff", borderRadius: 18, padding: "10px 18px", fontSize: 20, fontWeight: 800, color: "#111827" }}>
              <span style={{ color: "#a855f7" }}>○</span>
              {time}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 96, display: "flex", flexDirection: "column" }}>
          <div style={{ height: 4, background: "#8b5cf6", opacity: 0.78 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "8px 52px", background: "rgba(255,255,255,0.76)", height: 92 }}>
            <img src={LOGO_JNM} width={70} height={70} style={{ objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, color: "#111827" }}>Sociedade Espírita</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#f97316" }}>João Nunes Maia</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 1, height: 54, background: "#c4b5fd" }} />
            <img src={LOGO_UEPI} width={92} height={68} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 500,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
