import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const [[{ total }], admin] = await Promise.all([db.select({ total: count() }).from(adminUsers), getCurrentAdmin()]);
  if (total === 0) redirect("/signup");
  if (admin) redirect("/books");
  return <AuthForm mode="signin" />;
}
