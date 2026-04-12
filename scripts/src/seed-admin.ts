import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seedAdmin() {
  const adminEmail = "admin@bfc.com";
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail));

  if (existing.length > 0) {
    console.log("Admin user already exists.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(usersTable).values({
    name: "BFC Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log("Admin user created:");
  console.log("  Email: admin@bfc.com");
  console.log("  Password: admin123");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
