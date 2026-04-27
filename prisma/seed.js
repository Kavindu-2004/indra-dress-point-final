const path = require("path");

// Force-load .env from project root
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env");
  process.exit(1);
}

// Prisma v7 requires adapter
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { name: "New Arrivals", slug: "new-arrivals" },
    { name: "Workwear", slug: "workwear" },
    { name: "Dresses", slug: "dresses" },
    { name: "Evening Wear", slug: "evening-wear" },
    { name: "Accessories", slug: "accessories" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  console.log("✅ Categories seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });