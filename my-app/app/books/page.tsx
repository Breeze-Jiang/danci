"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Button, Input } from "@/components/ui";

const books = [
  { code: "PEP", title: "人教版小学英语（三年级上）", grade: "小学三年级", words: 186, updated: "2026-08-24", color: "bg-[#1a7f78]", status: "已发布" },
  { code: "PEP", title: "人教版小学英语（三年级下）", grade: "小学三年级", words: 204, updated: "2026-08-20", color: "bg-[#315f91]", status: "已发布" },
  { code: "KET", title: "剑桥 KET 核心词汇", grade: "初级", words: 928, updated: "2026-08-18", color: "bg-[#9a5b3f]", status: "编辑中" },
  { code: "CET4", title: "大学英语四级高频词", grade: "大学", words: 1240, updated: "2026-08-11", color: "bg-[#625294]", status: "已发布" },
  { code: "IELTS", title: "雅思学术场景词汇", grade: "进阶", words: 756, updated: "2026-08-03", color: "bg-[#ba7b24]", status: "已归档" },
];

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => books.filter((book) => book.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return <AdminShell><main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10 xl:p-12">
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Library / 01</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">单词书管理</h1><p className="mt-2 text-sm text-slate-500">维护词书内容、发布状态与词汇数量。</p></div>
      <Button><Plus size={17} />新建单词书</Button>
    </header>
    <section className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(15,23,42,.04)]">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索单词书名称" className="pl-10" /></div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-white px-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><SlidersHorizontal size={16} />筛选</button>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50/80 text-xs font-semibold text-slate-500"><tr><th className="px-6 py-3.5">词书</th><th className="px-5 py-3.5">适用阶段</th><th className="px-5 py-3.5">词汇数量</th><th className="px-5 py-3.5">状态</th><th className="px-5 py-3.5">最近更新</th><th className="w-16 px-5 py-3.5" /></tr></thead><tbody className="divide-y">{filtered.map((book, index) => <tr key={book.title} className="group transition hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-4"><div className={`relative h-14 w-11 shrink-0 rounded-r-md ${book.color} shadow-sm`}><span className="absolute inset-y-0 left-1 w-px bg-white/30" /><span className="grid h-full place-items-center text-[9px] font-bold tracking-wider text-white">{book.code}</span></div><div><p className="font-semibold text-slate-900">{book.title}</p><p className="mt-1 text-xs text-slate-400">BOOK-{String(index + 1).padStart(3, "0")}</p></div></div></td><td className="px-5 py-4 text-slate-600">{book.grade}</td><td className="px-5 py-4 font-medium tabular-nums text-slate-800">{book.words.toLocaleString()}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${book.status === "已发布" ? "bg-teal-50 text-teal-700" : book.status === "编辑中" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}><span className="size-1.5 rounded-full bg-current" />{book.status}</span></td><td className="px-5 py-4 tabular-nums text-slate-500">{book.updated}</td><td className="px-5 py-4"><button className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-slate-500"><span>共 {filtered.length} 本单词书</span><div className="flex items-center gap-1"><button className="grid size-8 place-items-center rounded-md border text-slate-400"><ChevronLeft size={16} /></button><button className="grid size-8 place-items-center rounded-md bg-slate-900 text-xs font-semibold text-white">1</button><button className="grid size-8 place-items-center rounded-md border text-slate-600"><ChevronRight size={16} /></button></div></div>
    </section>
    {filtered.length === 0 ? <div className="mt-10 grid place-items-center text-center"><BookOpen size={28} className="mb-3 text-slate-300" /><p className="text-sm text-slate-500">未找到匹配的单词书</p></div> : null}
  </main></AdminShell>;
}
