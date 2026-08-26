"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, Eye, EyeOff } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (isSignup && password !== String(data.get("confirmPassword"))) {
      setError("两次输入的密码不一致");
      return;
    }
    localStorage.setItem("danci-admin", JSON.stringify({
      name: String(data.get("name") || "系统管理员"),
      email: String(data.get("email")),
    }));
    router.push("/books");
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="animate-enter w-full max-w-[420px]">
          <Link href="/" className="mb-14 inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
            <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-white"><BookOpen size={18} /></span>
            拾词管理台
          </Link>
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Administrator access</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{isSignup ? "创建管理员账户" : "欢迎回来"}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">{isSignup ? "注册系统管理员，开始维护你的词库内容。" : "登录后继续管理单词书与团队成员。"}</p>
          </div>
          <form onSubmit={submit} className="grid gap-5">
            {isSignup ? <Field label="姓名"><Input name="name" placeholder="请输入姓名" required /></Field> : null}
            <Field label="邮箱"><Input name="email" type="email" placeholder="admin@example.com" required /></Field>
            <Field label="密码">
              <div className="relative"><Input name="password" type={showPassword ? "text" : "password"} placeholder="至少 8 位字符" minLength={8} required className="pr-11" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="切换密码可见性">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </Field>
            {isSignup ? <Field label="确认密码"><Input name="confirmPassword" type="password" placeholder="请再次输入密码" minLength={8} required /></Field> : null}
            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="mt-1 w-full">{isSignup ? "创建账户" : "登录"}<ArrowRight size={16} /></Button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">{isSignup ? "已有管理员账户？" : "还没有管理员账户？"}<Link href={isSignup ? "/signin" : "/signup"} className="ml-1 font-semibold text-slate-900 hover:text-teal-700">{isSignup ? "去登录" : "立即注册"}</Link></p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#10263f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 size-80 rounded-full border border-white/10" /><div className="absolute -right-2 top-16 size-44 rounded-full border border-teal-300/20" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Vocabulary operations</p>
        <div className="relative max-w-xl">
          <p className="mb-8 font-serif text-5xl leading-[1.16] tracking-tight">让每一本词书，<br />都清晰、准确、可追溯。</p>
          <div className="grid gap-4 border-t border-white/15 pt-7 text-sm text-slate-300 sm:grid-cols-3">
            {["统一维护词书", "审核内容状态", "协同管理员"].map((item) => <div key={item} className="flex items-center gap-2"><Check size={15} className="text-teal-300" />{item}</div>)}
          </div>
        </div>
        <p className="relative text-xs text-slate-400">SHICI · CONTENT SYSTEM</p>
      </aside>
    </main>
  );
}
