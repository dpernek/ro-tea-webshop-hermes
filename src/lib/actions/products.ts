"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

export async function getProducts(page = 1, limit = 20, search = "") {
  await requireAdmin();
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" as any } },
      { sku: { contains: search, mode: "insensitive" as any } },
    ];
  }
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" as any },
    }),
    db.product.count({ where }),
  ]);
  return { products, total, pages: Math.ceil(total / limit) };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

export async function toggleProductStatus(id: string, status: string) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin/products");
}
