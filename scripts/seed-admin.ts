import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = (process.env.DATABASE_URL || "file:./dev.db").replace(
  "file:",
  ""
);
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbPath }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL || "davor.pernek@ro-tea.hr";
  const password = process.env.ADMIN_PASSWORD || "rotea2006";
  const hash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: "ADMIN", name: "Davor Pernjek" },
    });
    console.log("Updated existing admin:", email);
  } else {
    await prisma.user.create({
      data: { name: "Davor Pernjek", email, passwordHash: hash, role: "ADMIN" },
    });
    console.log("Created admin:", email);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
