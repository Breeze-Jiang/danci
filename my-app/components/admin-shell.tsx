"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { BookOpen, Library, LogOut, Menu, ShieldCheck, X } from "lucide-react";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rawAdmin = useSyncExternalStore(
    () => () => undefined,
    () => localStorage.getItem("danci-admin"),
    () => null,
  );
  let email = "admin@example.com";
  let isValid = false;
  if (rawAdmin) {
    try { email = JSON.parse(rawAdmin).email || email; isValid = true; } catch { isValid = false; }
  }

  useEffect(() => {
    if (rawAdmin !== null && !isValid) localStorage.removeItem("danci-admin");
    if (!isValid) router.replace("/signin");
  }, [isValid, rawAdmin, router]);

  function logout() {
    localStorage.removeItem("danci-admin");
    router.replace("/signin");
  }

  if (!isValid) return <main className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">正在验证登录状态…</main>;

  const links = [
    { href: "/books", label: "单词书管理", icon: Library },
    { href: "/admin-users", label: "管理员管理", icon: ShieldCheck },
  ];

  const sidebar = <>
    <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
      <Link href="/books" className="flex items-center gap-2.5 font-semibold text-white"><span className="grid size-9 place-items-center rounded-xl bg-teal-400 text-slate-950"><BookOpen size={18} /></span>拾词管理台</Link>
      <button onClick={() => setOpen(false)} className="text-slate-400 lg:hidden" aria-label="关闭菜单"><X size={20} /></button>
    </div>
    <nav className="flex-1 space-y-1.5 p-4 pt-7">
      <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">内容工作区</p>
      {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${pathname === href ? "bg-white text-slate-950 shadow-sm" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}><Icon size={18} />{label}</Link>)}
    </nav>
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-300 text-xs font-bold text-slate-950">管</span>
        <div className="min-w-0 flex-1"><p className="text-xs text-slate-500">当前账户</p><p className="truncate text-sm text-slate-200">{email}</p></div>
        <button onClick={logout} className="text-slate-400 transition hover:text-white" aria-label="退出登录" title="退出登录"><LogOut size={18} /></button>
      </div>
    </div>
  </>;

  return <div className="min-h-screen bg-[#f7f9fb] lg:grid lg:grid-cols-[248px_1fr]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#10263f] lg:flex">{sidebar}</aside>
    {open ? <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} aria-label="关闭菜单遮罩" /><aside className="relative flex h-full w-[280px] flex-col bg-[#10263f] shadow-2xl">{sidebar}</aside></div> : null}
    <div className="lg:col-start-2">
      <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white/90 px-5 backdrop-blur lg:hidden"><button onClick={() => setOpen(true)} className="mr-3 text-slate-700" aria-label="打开菜单"><Menu size={21} /></button><span className="font-semibold">拾词管理台</span></header>
      {children}
    </div>
  </div>;
}
