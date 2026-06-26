import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ slug: string }>; }

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  try {
    const cat = await db.category.findUnique({ where: { slug }, select: { name: true, description: true } });
    if (!cat) notFound();
    return <div><h1>{cat.name}</h1><p>{cat.description}</p></div>;
  } catch (e: any) {
    return <div>Error: {e.message}</div>;
  }
}
