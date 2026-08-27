import { count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  const [{ total }] = await db.select({ total: count() }).from(adminUsers);
  if (total > 0) redirect("/signin");
  return <AuthForm mode="signup" />;
}
