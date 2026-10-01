import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ComplianceError, publishPriceList } from "@/lib/compliance/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (
    !secret ||
    Buffer.byteLength(authorization) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await publishPriceList());
  } catch (error) {
    return NextResponse.json(
      {
        errors:
          error instanceof ComplianceError
            ? error.details
            : ["Objava nije uspjela."],
      },
      { status: 503 }
    );
  }
}
