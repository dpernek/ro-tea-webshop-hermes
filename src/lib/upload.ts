// Upload abstraction layer. Supabase Storage is the production default.
// Local filesystem only for development (NODE_ENV !== "production").
//
// Env vars:
//   SUPABASE_STORAGE_BUCKET — bucket name (default: "images")
//   NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key
//   UPLOAD_PROVIDER — "supabase-storage" (default), "cloudinary", "local"

export async function uploadFile(file: File, destDir = "images"): Promise<{ url: string }> {
  const provider = process.env.UPLOAD_PROVIDER || detectProvider();

  if (provider === "local") {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
      throw new Error("Produkcijski upload storage nije konfiguriran. Postavite UPLOAD_PROVIDER=supabase-storage u Vercel okruženju.");
    }
    return uploadLocal(file, destDir);
  }

  if (provider === "supabase-storage") return uploadSupabase(file, destDir);
  if (provider === "cloudinary") return uploadCloudinary(file);
  throw new Error("Unknown UPLOAD_PROVIDER: " + provider);
}

function detectProvider(): string {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) return "supabase-storage";
  return "local";
}

async function uploadSupabase(file: File, destDir: string): Promise<{ url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "images";
  if (!baseUrl || !key) throw new Error("Supabase env vars missing");

  const safeName = sanitize(file.name);
  const filename = destDir + "/" + Date.now() + "-" + safeName;
  const bytes = await file.arrayBuffer();

  const res = await fetch(baseUrl + "/storage/v1/object/" + bucket + "/" + filename, {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": file.type || "image/webp" },
    body: bytes,
  });

  if (!res.ok) {
    const err = await res.json().catch(function() { return {}; });
    throw new Error("Supabase upload failed: " + ((err as any).message || res.status));
  }
  return { url: baseUrl + "/storage/v1/object/public/" + bucket + "/" + filename };
}

async function uploadCloudinary(file: File): Promise<{ url: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET || "ro-tea";
  if (!cloudName) throw new Error("CLOUDINARY_CLOUD_NAME env var missing");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  const res = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return { url: data.secure_url };
}

async function uploadLocal(file: File, destDir: string): Promise<{ url: string }> {
  const fs = await import("fs/promises");
  const p = await import("path");
  const bytes = await file.arrayBuffer();
  const safeName = sanitize(file.name);
  const filename = Date.now() + "-" + safeName;
  const dir = p.join(process.cwd(), "public", "images", destDir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(p.join(dir, filename), Buffer.from(bytes));
  return { url: "/images/" + destDir + "/" + filename };
}

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.-]/g, "-").replace(/-+/g, "-").slice(-100);
}
