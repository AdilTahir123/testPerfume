import { sql } from "drizzle-orm";
import { blob, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tag: text("tag").notNull(), // "For him" | "For her" | "Unisex"
  description: text("description").notNull().default(""),
  price: integer("price").notNull(), // PKR, whole rupees
  stock: integer("stock").notNull().default(0),
  sizeMl: integer("size_ml").notNull().default(50),
  image: text("image").notNull(),
  imageAlt: text("image_alt").notNull().default(""),
  topNotes: text("top_notes").notNull().default(""),
  heartNotes: text("heart_notes").notNull().default(""),
  baseNotes: text("base_notes").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // "customer" | "admin"
  createdAt: createdAt(),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id), // empty for guest checkout
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  note: text("note"),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").notNull().default(0),
  delivery: integer("delivery").notNull().default(0), // free delivery for now
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull(), // "cod" | "bank_transfer"
  status: text("status").notNull().default("pending"), // pending | confirmed | shipped | delivered | cancelled
  couponCode: text("coupon_code"),
  // Payment tracking. paymentStatus: unpaid (cash on delivery) | awaiting_payment (online gateway) | pending_verification
  // (bank transfer / manual check) | paid | rejected | failed
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  paymentRef: text("payment_ref"), // customer's bank transaction reference
  paymentReceipt: text("payment_receipt"), // "db:<receipt id>"
  gatewayTxnId: text("gateway_txn_id").unique(), // our reference sent to JazzCash / Easypaisa
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: createdAt(),
});

// Payment receipts live in the database (private: only the admin route can read them; works on Vercel where files do not persist).
export const paymentReceipts = sqliteTable("payment_receipts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  createdAt: createdAt(),
});

// Every change of payment status is written here, so there is always a history.
export const paymentEvents = sqliteTable("payment_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actor: text("actor").notNull(), // system | customer | gateway:jazzcash | admin:<email>
  note: text("note"),
  createdAt: createdAt(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  name: text("name").notNull(), // copied at order time, so old orders stay correct
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // "percent" | "fixed"
  value: integer("value").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  usedCount: integer("used_count").notNull().default(0),
  createdAt: createdAt(),
});

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const wishlist = sqliteTable(
  "wishlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [unique().on(t.userId, t.productId)],
);

export type Product = typeof products.$inferSelect;

// Failed login counter per email, so passwords cannot be guessed endlessly (works on serverless because it lives in the database).
export const loginAttempts = sqliteTable("login_attempts", {
  email: text("email").primaryKey(),
  fails: integer("fails").notNull().default(0),
  firstAt: integer("first_at").notNull(), // unix seconds of the first failure in the current window
});
