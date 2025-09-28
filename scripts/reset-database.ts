#!/usr/bin/env bun

// Justification: This is a utility script where console output is the primary way to show progress

import { execSync } from "child_process";

async function resetDatabase() {
  console.log("🔄 Resetting database with fresh seed data...\n");

  try {
    // Reset the database
    console.log("🧹 Resetting database...");
    execSync("bun run push", { stdio: "inherit" });
    console.log("   ✅ Database reset complete");

    // Seed with fresh data
    console.log("\n🌱 Seeding database...");
    execSync("bun run seed", { stdio: "inherit" });
    console.log("   ✅ Database seeded complete");

    console.log("\n✅ Database reset and seeding completed successfully!");
    console.log("\n💡 The database now contains fresh test data.");
    console.log(
      "   - Use 'bun run studio' to explore the data in Prisma Studio"
    );
    console.log(
      "   - Use 'bun run scripts/demo-database-seed.ts' to see a summary"
    );
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
