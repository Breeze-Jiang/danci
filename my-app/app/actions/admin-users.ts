"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { adminUsers, type AdminRole } from "@/lib/db/schema";
import { hashPassword, requireSystemAdmin } from "@/lib/auth";

export type AdminActionState = { error?: string; success?: boolean };

function validRole(value: string): value is AdminRole {
  return value === "system" || value === "admin";
}

export async function createAdmin(formData: FormData): Promise<AdminActionState> {
  if (!(await requireSystemAdmin())) return { error: "无权执行该操作" };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "admin");
  if (!name || !email || password.length < 8 || !validRole(role)) return { error: "请填写有效信息，密码至少 8 位" };
  try {
    await db.insert(adminUsers).values({ name, email, passwordHash: await hashPassword(password), role });
    revalidatePath("/admin-users");
    return { success: true };
  } catch {
    return { error: "创建失败，该邮箱可能已存在" };
  }
}

export async function updateAdmin(formData: FormData): Promise<AdminActionState> {
  const current = await requireSystemAdmin();
  if (!current) return { error: "无权执行该操作" };
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "");
  const isActive = String(formData.get("isActive")) === "true";
  if (!id || !name || !validRole(role)) return { error: "提交的数据无效" };
  if (id === current.id && (role !== "system" || !isActive)) return { error: "不能停用自己或降低自己的权限" };
  await db.update(adminUsers).set({ name, role, isActive, updatedAt: new Date() }).where(eq(adminUsers.id, id));
  revalidatePath("/admin-users");
  return { success: true };
}
