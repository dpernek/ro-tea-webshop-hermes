import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadFile } from "@/lib/upload";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

// Magic bytes signatures for supported image types
const SIGNATURES: Record<string, { offset: number; bytes: RegExp | ((buf: Uint8Array) => boolean) }> = {
  "image/png":    { offset: 0, bytes: /^\x89PNG\r\n\x1a\n/ },
  "image/jpeg":   { offset: 0, bytes: (buf) => buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff },
  "image/webp":   { offset: 0, bytes: (buf) => buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 },
};

function validateMagicBytes(buffer: ArrayBuffer, contentType: string): boolean {
  const check = SIGNATURES[contentType];
  if (!check) return true; // Unknown type — let MIME whitelist handle it

  const bytes = new Uint8Array(buffer.slice(check.offset, check.offset + 12));
  if (typeof check.bytes === "function") return check.bytes(bytes);
  return check.bytes.test(new TextDecoder().decode(bytes));
}

export async function POST(request: NextRequest) {
  const access = await requireAdmin();
  if (access) return access;

  let formData: FormData;
  try { formData = await request.formData(); } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type. Allowed: webp, jpg, png" }, { status: 400 });

  // Magic bytes content validation
  try {
    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "Datoteka nije valjana PNG/JPEG/WEBP slika." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Ne mogu pročitati datoteku." }, { status: 400 });
  }

  try {
    const result = await uploadFile(file, "products");
    return NextResponse.json({ url: result.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
