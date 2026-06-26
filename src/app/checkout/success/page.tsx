"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SuccessRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const sessionId = params.get("session_id");
    router.replace(`/checkout/uspjeh${sessionId ? `?session_id=${sessionId}` : ""}`);
  }, []);
  return null;
}
