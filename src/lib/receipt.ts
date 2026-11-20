const MAX = 4 * 1024 * 1024;

// Checks the real file contents (not the type the browser claims). Returns the bytes and the verified type.
export async function checkReceipt(file: File): Promise<{ buf: Buffer; type: string } | { error: string }> {
  if (file.size === 0) return { error: "Receipt must be a JPG, PNG, WebP or PDF file." };
  if (file.size > MAX) return { error: "Receipt must be under 4 MB." };
  const buf = Buffer.from(await file.arrayBuffer());
  const head = buf.subarray(0, 12);
  let type = "";
  if (head.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) type = "image/png";
  else if (head.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) type = "image/jpeg";
  else if (head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP") type = "image/webp";
  else if (head.subarray(0, 5).toString() === "%PDF-") type = "application/pdf";
  else return { error: "Receipt must be a JPG, PNG, WebP or PDF file." };
  return { buf, type };
}
