// Upload abstraction layer. Default: local public/images/ storage.
// For production, set UPLOAD_PROVIDER env var and configure corresponding keys.
// Supported: "local" (default), "vercel-blob", "supabase-storage", "cloudinary"

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadFile(file: File, destDir = "products"): Promise<{ url: string }> {
  const provider = process.env.UPLOAD_PROVIDER || "local";

  switch (provider) {
    case "supabase-storage":
      return uploadToSupabase(file, destDir);
    case "cloudinary":
      return uploadToCloudinary(file);
    case "local":
    default:
      return uploadToLocal(file, destDir);
  }
}

async function uploadToLocal(file: File, destDir: string): Promise<{ url: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = sanitizeFilename(file.name);
  const filename = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "images", destDir);
  await mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);
  return { url: `/images/${destDir}/${filename}` };
}

async function uploadToSupabase(file: File, destDir: string): Promise<{ url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "products";
  if (!baseUrl || !key) throw new Error("Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");

  const safeName = sanitizeFilename(file.name);
  const filename = `${destDir}/${Date.now()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  const res = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${filename}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": file.type },
    body: bytes,
  });

  if (!res.ok) throw new Error(`Supabase upload failed: ${res.status}`);
  return { url: `${baseUrl}/storage/v1/object/public/${bucket}/${filename}` };
}

async function uploadToCloudinary(file: File): Promise<{ url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "ro-tea";
  if (!cloudName) throw new Error("CLOUDINARY_CLOUD_NAME env var missing");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return { url: data.secure_url };
}

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.-]/g, "-").replace(/-+/g, "-").slice(-100);
}
