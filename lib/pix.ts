const PIX_KEY      = "01461832000178";
const PIX_RECEIVER = "Sociedade Espirita Joao Nunes Maia";

function onlyAscii(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 $%*+\-./:]/g, "")
    .toUpperCase()
    .slice(0, maxLength);
}

function tlv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(amount: number): string {
  const merchantAccount   = tlv("00", "br.gov.bcb.pix") + tlv("01", PIX_KEY);
  const additionalData    = tlv("05", "JNM");
  const amountField       = amount > 0 ? tlv("54", amount.toFixed(2)) : "";
  const payloadWithoutCrc = [
    tlv("00", "01"),
    tlv("26", merchantAccount),
    tlv("52", "0000"),
    tlv("53", "986"),
    amountField,
    tlv("58", "BR"),
    tlv("59", onlyAscii(PIX_RECEIVER, 25)),
    tlv("60", "TERESINA"),
    tlv("62", additionalData),
    "6304",
  ].join("");
  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function pixQrImage(payload: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(payload)}`;
}

export { PIX_KEY, PIX_RECEIVER };
