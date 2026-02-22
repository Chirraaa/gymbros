import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENTS } from "../lib/achievements";

const prisma = new PrismaClient();

async function main() {
  for (const ach of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    });
  }
  console.log("✅ Achievements seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());