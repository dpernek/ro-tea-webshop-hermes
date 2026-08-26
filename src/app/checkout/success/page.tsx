import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  redirect(
    session_id
      ? `/checkout/uspjeh?session_id=${encodeURIComponent(session_id)}`
      : "/checkout/uspjeh"
  );
}
