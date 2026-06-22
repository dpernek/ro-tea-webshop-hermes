import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  await db.catalog.create({
    data: {
      name: body.name,
      brand: body.brand,
      description: body.description || "",
      fileUrl: body.fileUrl,
      active: body.active !== "false",
      sortOrder: parseInt(body.sortOrder) || 0,
    },
  });
  revalidatePath("/admin/katalozi");
  return NextResponse.json({ success: true });
}
