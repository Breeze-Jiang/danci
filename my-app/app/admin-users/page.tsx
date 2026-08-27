import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { AdminUsersClient } from "@/components/admin-users-client";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/signin");
  if (admin.role !== "system") redirect("/books");
  const users = await db.select({
    id: adminUsers.id,
    name: adminUsers.name,
    email: adminUsers.email,
    role: adminUsers.role,
    isActive: adminUsers.isActive,
    lastLoginAt: adminUsers.lastLoginAt,
  }).from(adminUsers).orderBy(asc(adminUsers.createdAt));
  return <AdminShell admin={admin}><AdminUsersClient users={users} currentAdminId={admin.id} /></AdminShell>;
}
