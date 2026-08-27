"use server";

import { count, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { createSession, deleteSession, hashPassword, verifyPassword } from "@/lib/auth";

export type AuthActionState = { error?: string; success?: boolean };

function readCredentials(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
    confirmPassword: String(formData.get("confirmPassword") || ""),
  };
}

export async function signupSystemAdmin(formData: FormData): Promise<AuthActionState> {
  const { name, email, password, confirmPassword } = readCredentials(formData);
  if (!name || !email || password.length < 8) return { error: "请完整填写信息，密码至少 8 位" };
  if (password !== confirmPassword) return { error: "两次输入的密码不一致" };

  const passwordHash = await hashPassword(password);
  try {
    const admin = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(734921)`);
      const [{ total }] = await tx.select({ total: count() }).from(adminUsers);
      if (total > 0) return null;
      const [created] = await tx.insert(adminUsers).values({ name, email, passwordHash, role: "system" }).returning({ id: adminUsers.id });
      return created;
    });
    if (!admin) return { error: "系统管理员已存在，请直接登录" };
    await createSession(admin.id);
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) return { error: "该邮箱已被使用" };
    return { error: "注册失败，请稍后重试" };
  }
}

export async function signinAdmin(formData: FormData): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!admin || !admin.isActive || !(await verifyPassword(password, admin.passwordHash))) return { error: "邮箱或密码错误" };
  await db.update(adminUsers).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  await createSession(admin.id);
  return { success: true };
}

export async function signoutAdmin() {
  await deleteSession();
}
