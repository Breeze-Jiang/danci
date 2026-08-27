"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Pencil, Plus, Search, ShieldCheck, X } from "lucide-react";
import { createAdmin, updateAdmin } from "@/app/actions/admin-users";
import { Button, Field, Input } from "@/components/ui";
import type { AdminRole } from "@/lib/db/schema";

type UserRow = { id: string; name: string; email: string; role: AdminRole; isActive: boolean; lastLoginAt: Date | null };

export function AdminUsersClient({ users, currentAdminId }: { users: UserRow[]; currentAdminId: string }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"create" | UserRow | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const visible = users.filter((user) => `${user.name}${user.email}`.toLowerCase().includes(query.toLowerCase()));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = modal === "create" ? await createAdmin(formData) : await updateAdmin(formData);
      if (result.error) { setError(result.error); return; }
      setModal(null);
    });
  }

  return <main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10 xl:p-12"><header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Team / 02</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">管理员管理</h1><p className="mt-2 text-sm text-slate-500">管理后台成员、角色与账户状态。</p></div><Button onClick={() => { setError(""); setModal("create"); }}><Plus size={17} />添加管理员</Button></header><div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">管理员总数</p><p className="mt-3 text-3xl font-bold">{users.length}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">当前活跃</p><p className="mt-3 text-3xl font-bold text-teal-700">{users.filter((user) => user.isActive).length}</p></div><div className="rounded-xl border bg-[#10263f] p-5 text-white"><div className="flex justify-between"><p className="text-sm text-slate-300">系统管理员</p><ShieldCheck size={20} className="text-teal-300" /></div><p className="mt-3 text-3xl font-bold">{users.filter((user) => user.role === "system").length}</p></div></div><section className="overflow-hidden rounded-xl border bg-white"><div className="border-b p-4"><div className="relative max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索姓名或邮箱" className="pl-10" /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-6 py-3.5">管理员</th><th className="px-5 py-3.5">角色</th><th className="px-5 py-3.5">状态</th><th className="px-5 py-3.5">最近登录</th><th /></tr></thead><tbody className="divide-y">{visible.map((user) => <tr key={user.id} className="hover:bg-slate-50"><td className="px-6 py-4"><p className="font-semibold">{user.name}{user.id === currentAdminId ? "（当前）" : ""}</p><p className="text-xs text-slate-500">{user.email}</p></td><td className="px-5 py-4">{user.role === "system" ? "系统管理员" : "普通管理员"}</td><td className="px-5 py-4"><span className={user.isActive ? "text-teal-700" : "text-slate-400"}>{user.isActive ? "正常" : "已停用"}</span></td><td className="px-5 py-4 text-slate-500">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("zh-CN") : "从未登录"}</td><td className="px-5"><button onClick={() => { setError(""); setModal(user); }} className="grid size-8 place-items-center rounded-md hover:bg-slate-100" aria-label="编辑管理员"><Pencil size={16} /></button></td></tr>)}</tbody></table></div><div className="border-t px-6 py-4 text-sm text-slate-500">共 {visible.length} 位管理员</div></section>{modal ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold">{modal === "create" ? "添加管理员" : "编辑管理员"}</h2><button onClick={() => setModal(null)}><X size={20} /></button></div><form onSubmit={submit} className="grid gap-4">{modal !== "create" ? <input type="hidden" name="id" value={modal.id} /> : null}<Field label="姓名"><Input name="name" defaultValue={modal === "create" ? "" : modal.name} required /></Field>{modal === "create" ? <><Field label="邮箱"><Input name="email" type="email" required /></Field><Field label="初始密码"><Input name="password" type="password" minLength={8} required /></Field></> : null}<Field label="角色"><select name="role" defaultValue={modal === "create" ? "admin" : modal.role} className="h-11 rounded-lg border bg-white px-3 text-sm"><option value="admin">普通管理员</option><option value="system">系统管理员</option></select></Field>{modal !== "create" ? <Field label="账户状态"><select name="isActive" defaultValue={String(modal.isActive)} className="h-11 rounded-lg border bg-white px-3 text-sm"><option value="true">正常</option><option value="false">停用</option></select></Field> : null}{error ? <p className="text-sm text-red-600">{error}</p> : null}<Button disabled={pending}>{pending ? "保存中…" : "保存"}</Button></form></div></div> : null}</main>;
}
