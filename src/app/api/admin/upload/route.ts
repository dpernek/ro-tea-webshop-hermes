import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"];

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.+/g, ".");
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Max 5MB" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "images", "products");
  await mkdir(uploadDir, { recursive: true });

  const baseName = path.basename(file.name, ext);
  const sanitized = sanitizeFilename(baseName) || "image";
  const timestamp = Date.now();
  const filename = `${sanitized}-${timestamp}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const url = `/images/products/${filename}`;
  return NextResponse.json({ url });
}
