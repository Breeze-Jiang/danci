"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Search, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Button, Input } from "@/components/ui";

const users = [
  { name: "林知夏", email: "admin@example.com", role: "超级管理员", status: "正常", last: "今天 09:42", initials: "林", color: "bg-[#d9eeeb] text-teal-800" },
  { name: "陈默", email: "chenmo@example.com", role: "内容管理员", status: "正常", last: "昨天 16:18", initials: "陈", color: "bg-blue-100 text-blue-800" },
  { name: "周雨", email: "zhouyu@example.com", role: "内容管理员", status: "正常", last: "2026-08-22", initials: "周", color: "bg-violet-100 text-violet-800" },
  { name: "宋言", email: "songyan@example.com", role: "只读成员", status: "已停用", last: "2026-07-30", initials: "宋", color: "bg-amber-100 text-amber-800" },
];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const visible = users.filter((user) => `${user.name}${user.email}`.toLowerCase().includes(query.toLowerCase()));
  return <AdminShell><main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10 xl:p-12">
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Team / 02</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">管理员管理</h1><p className="mt-2 text-sm text-slate-500">管理后台成员、角色与账户状态。</p></div><Button><Plus size={17} />添加管理员</Button></header>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">管理员总数</p><p className="mt-3 text-3xl font-bold tabular-nums text-slate-950">04</p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">当前活跃</p><p className="mt-3 text-3xl font-bold tabular-nums text-teal-700">03</p></div><div className="rounded-xl border bg-[#10263f] p-5 text-white"><div className="flex items-center justify-between"><p className="text-sm text-slate-300">权限角色</p><ShieldCheck size={20} className="text-teal-300" /></div><p className="mt-3 text-3xl font-bold tabular-nums">03</p></div></div>
    <section className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(15,23,42,.04)]"><div className="border-b p-4"><div className="relative max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名或邮箱" className="pl-10" /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50/80 text-xs font-semibold text-slate-500"><tr><th className="px-6 py-3.5">管理员</th><th className="px-5 py-3.5">角色</th><th className="px-5 py-3.5">账户状态</th><th className="px-5 py-3.5">最近登录</th><th className="w-16 px-5 py-3.5" /></tr></thead><tbody className="divide-y">{visible.map((user) => <tr key={user.email} className="hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3.5"><span className={`grid size-10 place-items-center rounded-full text-sm font-bold ${user.color}`}>{user.initials}</span><div><p className="font-semibold text-slate-900">{user.name}</p><p className="mt-0.5 text-xs text-slate-500">{user.email}</p></div></div></td><td className="px-5 py-4 text-slate-600">{user.role}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "正常" ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}><span className="size-1.5 rounded-full bg-current" />{user.status}</span></td><td className="px-5 py-4 text-slate-500">{user.last}</td><td className="px-5 py-4"><button className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div><div className="border-t px-6 py-4 text-sm text-slate-500">共 {visible.length} 位管理员</div></section>
  </main></AdminShell>;
}
