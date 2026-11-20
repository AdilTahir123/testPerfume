// Adds sample products and one coupon, only when the tables are empty.
// Run with: npm run db:seed
// Reads .env when it exists (a fresh copy of the project may not have one yet)
try {
  process.loadEnvFile(".env");
} catch {
  /* no .env file: the defaults below are used */
}

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { coupons, products, users } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/password";

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client);

  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length === 0) {
    await db.insert(products).values([
      {
        slug: "sample-one",
        name: "Sample Perfume One",
        tag: "For him",
        description: "Sample description. Replace with the real perfume story.",
        price: 4500,
        stock: 20,
        sizeMl: 50,
        image: "/images/sample-oud.jpg",
        imageAlt: "Sample perfume bottle, black with gold label and gold cap",
        topNotes: "Sample top",
        heartNotes: "Sample heart",
        baseNotes: "Sample base",
        featured: true,
      },
      {
        slug: "sample-two",
        name: "Sample Perfume Two",
        tag: "Unisex",
        description: "Sample description. Replace with the real perfume story.",
        price: 4500,
        stock: 20,
        sizeMl: 50,
        image: "/images/sample-queen.jpg",
        imageAlt: "Sample perfume bottle, red glass with gold cap on golden sand",
        topNotes: "Sample top",
        heartNotes: "Sample heart",
        baseNotes: "Sample base",
      },
      {
        slug: "sample-three",
        name: "Sample Perfume Three",
        tag: "For her",
        description: "Sample description. Replace with the real perfume story.",
        price: 4500,
        stock: 3,
        sizeMl: 50,
        image: "/images/sample-pink.jpg",
        imageAlt: "Sample perfume bottle, pink and peach glass with gold cap",
        topNotes: "Sample top",
        heartNotes: "Sample heart",
        baseNotes: "Sample base",
      },
    ]);
    console.log("Added 3 sample products.");
  } else {
    console.log("Products already exist, skipping.");
  }

  const hasCoupon = await db.select({ id: coupons.id }).from(coupons).limit(1);
  if (hasCoupon.length === 0) {
    await db.insert(coupons).values({ code: "WELCOME10", type: "percent", value: 10 });
    console.log("Added coupon WELCOME10 (10% off).");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const live = (process.env.DATABASE_URL ?? "").startsWith("libsql://");
  if (email && password && live && (password === "change-me-123" || password.length < 10)) {
    console.log("Admin NOT created: on the live database use a strong ADMIN_PASSWORD (10+ characters, not the sample one).");
  } else if (email && password) {
    const has = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
   if (has.length === 0) {
  await db.insert(users).values({
    name: "Admin",
    email,
    passwordHash: hashPassword(password),
    role: "admin",
  });

  console.log(`Created admin account ${email}`);
} else {
  await db.update(users)
    .set({
      passwordHash: hashPassword(password),
      role: "admin",
    })
    .where(eq(users.email, email));

  console.log(`Updated admin password for ${email}`);
}
  } else {
    console.log("No ADMIN_EMAIL / ADMIN_PASSWORD in .env, so no admin account was created.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
