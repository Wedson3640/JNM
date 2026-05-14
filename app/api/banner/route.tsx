import { ImageResponse } from "next/og";

export const runtime = "edge";

const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";
const LOGO_JNM  = `${BASE_URL}/images/logo%20JNM%20(1).png`;
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

  const speaker   = searchParams.get("speaker")   ?? "";
  const theme     = formatTheme(searchParams.get("theme") ?? "");
  const date      = searchParams.get("date")       ?? "";
  const weekday   = searchParams.get("weekday")    ?? "";
  const time      = searchParams.get("time")       ?? "";
  const platforms = searchParams.get("platforms")  ?? "YouTube";
  const photo     = searchParams.get("photo")      ?? "";

  const showFb = platforms === "Facebook" || platforms === "Ambos";
  const showYt = platforms === "YouTube"  || platforms === "Ambos";

  const [fontBold, fontExtraBold] = await Promise.all([
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OpenSans%5Bwdth,wght%5D.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
    fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/opensans/OpenSans%5Bwdth,wght%5D.ttf")
      .then((r) => r.arrayBuffer())
      .catch(() => null),
  ]);

  type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  const fonts: { name: string; data: ArrayBuffer; weight: FontWeight; style: "normal" }[] = [];
  if (fontBold)      fonts.push({ name: "Open Sans", data: fontBold,      weight: 700, style: "normal" });
  if (fontExtraBold) fonts.push({ name: "Open Sans", data: fontExtraBold, weight: 800, style: "normal" });

  const fontFamily = fonts.length ? "Open Sans" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #ddd6fe 0%, #ede9fe 40%, #fdf4ff 70%, #fff7ed 100%)",
          fontFamily,
          position: "relative",
        }}
      >
        {/* Dots decorativos */}
        <div style={{ position: "absolute", top: 36, left: 36, display: "flex", flexWrap: "wrap", width: 88, gap: 10, opacity: 0.22 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
          ))}
        </div>

        {/* Rainbow arco inferior — 6 anéis sobrepostos */}
        {/* Área principal */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "80px 70px 50px 70px", gap: 50 }}>

          {/* Foto circular */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "42%" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 440, height: 440, borderRadius: "50%", background: "rgba(167,139,250,0.45)", filter: "blur(55px)" }} />
              {photo ? (
                <img src={photo} width={400} height={400} style={{ borderRadius: "50%", border: "10px solid white", objectFit: "cover", objectPosition: "top", boxShadow: "0 20px 60px rgba(109,40,217,0.35)" }} />
              ) : (
                <div style={{ width: 400, height: 400, borderRadius: "50%", border: "10px solid white", background: "#e9d5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120 }}>👤</div>
              )}
            </div>
          </div>

          {/* Informações */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 26 }}>

            {/* Plataformas */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {showFb && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1877F2", color: "white", padding: "12px 26px", borderRadius: 14, fontSize: 30, fontWeight: 700 }}>
                  f Live
                </div>
              )}
              {showFb && showYt && <div style={{ fontSize: 42, color: "#c4b5fd", fontWeight: 300 }}>|</div>}
              {showYt && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FF0000", color: "white", padding: "12px 26px", borderRadius: 14, fontSize: 30, fontWeight: 700 }}>
                  ▶ YouTube
                </div>
              )}
            </div>

            {/* PALESTRANTE */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ flex: 1, height: 2, background: "#c4b5fd" }} />
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.28em", color: "#7c3aed" }}>PALESTRANTE</div>
              <div style={{ flex: 1, height: 2, background: "#c4b5fd" }} />
            </div>

            {/* Nome — 30% menor: 78 → 55 */}
            <div style={{ fontSize: 55, fontWeight: 800, color: "#1F2937", lineHeight: 1.1, display: "flex", flexWrap: "wrap" }}>
              {speaker}
            </div>

            {/* Tema */}
            <div style={{ display: "flex", flexDirection: "column", borderLeft: "8px solid #a78bfa", paddingLeft: 28, gap: 10 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.22em", color: "#7c3aed" }}>TEMA</div>
              <div style={{ fontSize: 40, fontWeight: 600, color: "#1F2937", lineHeight: 1.3, display: "flex", flexWrap: "wrap" }}>{theme}</div>
            </div>

            {/* Data e hora */}
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.75)", border: "2px solid #e9d5ff", borderRadius: 28, padding: "18px 30px", fontSize: 30, fontWeight: 600, color: "#374151" }}>
                📅 {date} ({weekday})
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.75)", border: "2px solid #e9d5ff", borderRadius: 28, padding: "18px 30px", fontSize: 30, fontWeight: 600, color: "#374151" }}>
                🕐 {time}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Faixa superior */}
          <div style={{ height: 6, background: "#8b5cf6", opacity: 0.8 }} />
          {/* Conteúdo do rodapé */}
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 70px", background: "rgba(255,255,255,0.72)" }}>
            <img src={LOGO_JNM} width={114} height={114} style={{ objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 26, color: "#6b7280" }}>Sociedade Espírita</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#f97316" }}>João Nunes Maia</div>
            </div>
            <div style={{ flex: 1 }} />
            <img src={LOGO_UEPI} width={100} height={100} style={{ objectFit: "contain" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
