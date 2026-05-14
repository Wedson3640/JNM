import { ImageResponse } from "next/og";

export const runtime = "edge";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const LOGO_JNM = `${BASE_URL}/images/logo%20JNM%20horizontal.png`;
const LOGO_UEPI = `${BASE_URL}/images/UEPI.png`;

function formatTheme(s: string) {
  const lowercaseWords = new Set(["a", "as", "ao", "aos", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no", "nos", "o", "os", "ou", "para", "por"]);

  return s
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word, index) => {
      const normalized = word.toLocaleLowerCase("pt-BR");
      if (index > 0 && lowercaseWords.has(normalized)) return normalized;
      return normalized.charAt(0).toLocaleUpperCase("pt-BR") + normalized.slice(1);
    })
    .join(" ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const speaker = searchParams.get("speaker") ?? "";
  const theme = formatTheme(searchParams.get("theme") ?? "");
  const date = searchParams.get("date") ?? "";
  const weekday = searchParams.get("weekday") ?? "";
  const time = searchParams.get("time") ?? "";
  const platforms = searchParams.get("platforms") ?? "YouTube";
  const photo = searchParams.get("photo") ?? "";

  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube" || platforms === "Ambos";

  const [fontBold, fontExtraBold] = await Promise.all([
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OpenSans%5Bwdth,wght%5D.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OpenSans%5Bwdth,wght%5D.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
  ]);

  type FontWeight = 700 | 800;
  const fonts: { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" }[] = [];
  if (fontBold) fonts.push({ name: "Open Sans", data: fontBold, weight: 700, style: "normal" });
  if (fontExtraBold) fonts.push({ name: "Open Sans", data: fontExtraBold, weight: 800, style: "normal" });

  const fontFamily = fonts.length ? "Open Sans" : "sans-serif";
  const speakerSize = speaker.length > 28 ? 54 : 66;
  const themeSize = theme.length > 36 ? 34 : theme.length > 22 ? 39 : 45;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(112deg, #ead9ff 0%, #fffaf4 48%, #fff3e8 100%)",
          fontFamily,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: -150, top: 120, width: 720, height: 720, borderRadius: "50%", background: "rgba(196,181,253,0.30)" }} />
        <div style={{ position: "absolute", left: 44, top: 168, width: 500, height: 500, borderRadius: "50%", border: "8px solid rgba(255,255,255,0.86)" }} />
        <div style={{ position: "absolute", left: 78, top: 202, width: 432, height: 432, borderRadius: "50%", border: "4px solid rgba(139,92,246,0.42)" }} />
        <div style={{ position: "absolute", right: -300, top: 80, width: 560, height: 560, borderRadius: "50%", border: "54px solid rgba(168,85,247,0.045)" }} />
        <div style={{ position: "absolute", right: -190, top: 294, width: 410, height: 410, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.62)" }} />
        <div style={{ position: "absolute", left: 540, top: -130, width: 5, height: 760, background: "rgba(255,255,255,0.72)", transform: "rotate(28deg)" }} />

        <div style={{ display: "flex", flex: 1, padding: "118px 92px 250px 86px", gap: 72, position: "relative" }}>
          <div style={{ width: 430, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {photo ? (
              <img alt="" src={photo} width={360} height={360} style={{ borderRadius: "50%", border: "10px solid white", objectFit: "cover", objectPosition: "top", boxShadow: "0 28px 70px rgba(88,28,135,0.26)" }} />
            ) : (
              <div style={{ width: 360, height: 360, borderRadius: "50%", border: "10px solid white", background: "#e9d5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 84, fontWeight: 800, color: "#7c3aed" }}>
                JNM
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, width: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {showFb && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, background: "rgba(24,119,242,0.10)", border: "1px solid rgba(24,119,242,0.25)", padding: "6px 14px", color: "#1877F2", fontSize: 18, fontWeight: 800 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1877F2", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 800 }}>f</span>
                  Facebook Live
                </div>
              )}
              {showYt && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#fff1f2", border: "1px solid rgba(248,113,113,0.42)", padding: "6px 14px", color: "#dc2626", fontSize: 18, fontWeight: 800 }}>
                  <span style={{ width: 30, height: 20, borderRadius: 6, background: "#ff0000", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>▶</span>
                  YouTube
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 78, height: 2, background: "#a78bfa" }} />
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "11px", color: "#7c3aed" }}>PALESTRANTE</div>
              <div style={{ width: 164, height: 2, background: "rgba(167,139,250,0.55)" }} />
            </div>

            <div style={{ fontSize: speakerSize, fontWeight: 800, color: "#2a0d4f", lineHeight: 1.04, maxWidth: 650 }}>
              {speaker}
            </div>

            <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
              <div style={{ width: 5, background: "#f97316", borderRadius: 8 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 560 }}>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "9px", color: "#8b5cf6" }}>TEMA</div>
                <div style={{ fontSize: themeSize, fontWeight: 700, color: "#1f2937", lineHeight: 1.14 }}>{theme}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.70)", border: "1px solid rgba(196,181,253,0.70)", borderRadius: 999, padding: "12px 20px", fontSize: 21, fontWeight: 800, color: "#374151" }}>
                <span style={{ color: "#a855f7", fontSize: 14, letterSpacing: "2px" }}>DATA</span>
                {date} {weekday ? `· ${weekday}` : ""}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.70)", border: "1px solid rgba(196,181,253,0.70)", borderRadius: 999, padding: "12px 20px", fontSize: 21, fontWeight: 800, color: "#374151" }}>
                <span style={{ color: "#a855f7", fontSize: 14, letterSpacing: "2px" }}>HORA</span>
                {time}
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 228, display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", left: -120, right: -120, top: 44, height: 230, borderTopLeftRadius: 420, borderTopRightRadius: 420, background: "rgba(255,255,255,0.78)" }} />
          <div style={{ position: "absolute", left: -120, right: -120, top: 39, height: 230, borderTopLeftRadius: 420, borderTopRightRadius: 420, borderTop: "5px solid #d946ef" }} />
          <div style={{ position: "absolute", left: -120, top: 39, width: 430, height: 230, borderTopLeftRadius: 420, borderTop: "5px solid #f97316" }} />
          <div style={{ position: "absolute", right: -120, top: 39, width: 430, height: 230, borderTopRightRadius: 420, borderTop: "5px solid #7c3aed" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, height: 110, display: "flex", alignItems: "center", justifyContent: "center", gap: 48 }}>
            <img alt="" src={LOGO_JNM} width={462} height={120} style={{ objectFit: "contain" }} />
            <div style={{ width: 1, height: 70, background: "rgba(167,139,250,0.72)" }} />
            <img alt="" src={LOGO_UEPI} width={129} height={129} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1536,
      height: 1024,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
