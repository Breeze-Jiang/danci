import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [[{ total }], admin] = await Promise.all([
    db.select({ total: count() }).from(adminUsers),
    getCurrentAdmin(),
  ]);
  if (total === 0) redirect("/signup");
  redirect(admin ? "/books" : "/signin");
}
