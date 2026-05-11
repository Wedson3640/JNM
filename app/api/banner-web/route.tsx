import { ImageResponse } from "next/og";

export const runtime = "edge";

const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const LOGO_JNM  = `${BASE_URL}/images/logo%20JNM%20horizontal.png`;
const LOGO_UEPI = `${BASE_URL}/images/UEPI.png`;

// Dimensões que espelham o hero carousel (proporção ~5:2)
const W = 1200;
const H = 500;

const RAINBOW = ["#ff4444", "#ff9900", "#ffee00", "#00cc66", "#4488ff", "#aa44ff"];

function titleCase(s: string) {
  return s.split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : "")).join(" ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const speaker   = searchParams.get("speaker")   ?? "";
  const theme     = titleCase(searchParams.get("theme") ?? "");
  const date      = searchParams.get("date")       ?? "";
  const weekday   = searchParams.get("weekday")    ?? "";
  const time      = searchParams.get("time")       ?? "";
  const platforms = searchParams.get("platforms")  ?? "YouTube";
  const photo     = searchParams.get("photo")      ?? "";

  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube"  || platforms === "Ambos";

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
  if (fontBold)      fonts.push({ name: "Poppins", data: fontBold,      weight: 700, style: "normal" });
  if (fontExtraBold) fonts.push({ name: "Poppins", data: fontExtraBold, weight: 800, style: "normal" });

  const ff = fonts.length ? "Poppins" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          fontFamily: ff,
          background: "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 35%, #fdf4ff 65%, #fff7ed 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow esquerdo */}
        <div style={{
          position: "absolute", top: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(167,139,250,0.35)", filter: "blur(60px)",
        }} />

        {/* Rainbow arco inferior — 6 anéis sobrepostos, centrados com left:-25% */}
        {RAINBOW.map((color, i) => (
          <div key={i} style={{
            position: "absolute",
            bottom: -262 + i * 6,
            left: "-25%",
            width: "150%",
            height: 420,
            borderRadius: "50%",
            border: `4px solid ${color}`,
            background: "transparent",
            opacity: 0.6,
          }} />
        ))}

        {/* Dots */}
        <div style={{ position: "absolute", top: 24, left: 24, display: "flex", flexWrap: "wrap", width: 72, gap: 8, opacity: 0.2 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed" }} />
          ))}
        </div>

        {/* Coluna esquerda — foto */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 380,
          paddingLeft: 40,
          paddingBottom: 75,
          flexShrink: 0,
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            width: 320, height: 320,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.3)",
            filter: "blur(40px)",
          }} />
          <div style={{
            position: "absolute",
            width: 295, height: 295,
            borderRadius: "50%",
            border: "3px solid rgba(167,139,250,0.6)",
          }} />
          {photo ? (
            <img
              src={photo}
              width={270}
              height={270}
              style={{
                borderRadius: "50%",
                border: "8px solid white",
                objectFit: "cover",
                objectPosition: "top",
                boxShadow: "0 12px 40px rgba(109,40,217,0.3)",
                position: "relative",
              }}
            />
          ) : (
            <div style={{
              width: 270, height: 270,
              borderRadius: "50%",
              border: "8px solid white",
              background: "#e9d5ff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 80, position: "relative",
            }}>👤</div>
          )}
        </div>

        {/* Coluna direita — informações */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "36px 48px 90px 16px",
          gap: 14,
          position: "relative",
        }}>

          {/* Badges de plataforma */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {showFb && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#1877F2", color: "white",
                padding: "8px 18px", borderRadius: 10,
                fontSize: 22, fontWeight: 700,
              }}>f Live</div>
            )}
            {showFb && showYt && (
              <div style={{ fontSize: 28, color: "#c4b5fd", fontWeight: 300 }}>|</div>
            )}
            {showYt && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#FF0000", color: "white",
                padding: "8px 18px", borderRadius: 10,
                fontSize: 22, fontWeight: 700,
              }}>▶ YouTube</div>
            )}
          </div>

          {/* PALESTRANTE */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1.5, background: "#c4b5fd" }} />
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.28em", color: "#7c3aed" }}>PALESTRANTE</div>
            <div style={{ flex: 1, height: 1.5, background: "#c4b5fd" }} />
          </div>

          {/* Nome — 30% menor: 62 → 43 */}
          <div style={{
            fontSize: 43, fontWeight: 800,
            color: "#1F2937", lineHeight: 1.05,
            display: "flex", flexWrap: "wrap",
          }}>
            {speaker}
          </div>

          {/* Tema */}
          <div style={{
            display: "flex", flexDirection: "column",
            borderLeft: "6px solid #a78bfa", paddingLeft: 18, gap: 4,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", color: "#7c3aed" }}>TEMA</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "#374151", lineHeight: 1.3, display: "flex", flexWrap: "wrap" }}>
              {theme}
            </div>
          </div>

          {/* Data e hora */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.75)",
              border: "1.5px solid #e9d5ff",
              borderRadius: 18, padding: "10px 20px",
              fontSize: 20, fontWeight: 600, color: "#374151",
            }}>
              📅 {date} ({weekday})
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.75)",
              border: "1.5px solid #e9d5ff",
              borderRadius: 18, padding: "10px 20px",
              fontSize: 20, fontWeight: 600, color: "#374151",
            }}>
              🕐 {time}
            </div>
          </div>
        </div>

        {/* Rodapé com arco-íris */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          display: "flex", flexDirection: "column",
        }}>
          {/* Faixa arco-íris */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #ff4444, #ff9900, #ffee00, #00cc66, #4488ff, #aa44ff)" }} />
          {/* Conteúdo */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "8px 40px",
            background: "rgba(255,255,255,0.78)",
          }}>
            <img src={LOGO_JNM} width={180} height={60} style={{ objectFit: "contain" }} />
            <div style={{ flex: 1 }} />
            <img src={LOGO_UEPI} width={60} height={60} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
