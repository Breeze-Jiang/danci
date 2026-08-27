"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { BookOpen, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import { createBook, deleteBook, updateBook } from "@/app/actions/books";
import { Button, Field, Input } from "@/components/ui";
import type { Book } from "@/lib/db/schema";

type BookModal = "create" | Book | null;

export function BooksContent({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<BookModal>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(() => books.filter((book) => `${book.title}${book.bookId}${book.tags.join("")}`.toLowerCase().includes(query.toLowerCase())), [books, query]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = modal === "create" ? await createBook(formData) : await updateBook(formData);
      if (result.error) { setError(result.error); return; }
      setModal(null);
    });
  }

  function remove(book: Book) {
    if (!window.confirm(`确定删除“${book.title}”吗？该词书关联的单词也会被删除。`)) return;
    const formData = new FormData();
    formData.set("id", String(book.id));
    setError("");
    startTransition(async () => {
      const result = await deleteBook(formData);
      if (result.error) setError(result.error);
    });
  }

  return <main className="mx-auto max-w-[1440px] p-5 sm:p-8 lg:p-10 xl:p-12">
    <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Library / 01</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">单词书管理</h1><p className="mt-2 text-sm text-slate-500">维护词书内容、发布状态与词汇数量。</p></div><Button onClick={() => { setError(""); setModal("create"); }}><Plus size={17} />新建单词书</Button></header>
    <section className="overflow-hidden rounded-xl border bg-white shadow-[0_1px_3px_rgba(15,23,42,.04)]"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索单词书名称或 bookid" className="pl-10" /></div><button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-white px-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50"><SlidersHorizontal size={16} />筛选</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50/80 text-xs font-semibold text-slate-500"><tr><th className="px-6 py-3.5">词书</th><th className="px-5 py-3.5">bookid</th><th className="px-5 py-3.5">词汇数量</th><th className="px-5 py-3.5">标签</th><th className="px-5 py-3.5">最近更新</th><th className="px-5 py-3.5">操作</th></tr></thead><tbody className="divide-y">{filtered.map((book) => <tr key={book.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-4"><div className="relative grid h-14 w-11 place-items-center rounded-r-md bg-teal-700"><span className="text-[9px] font-bold text-white">BOOK</span></div><div><p className="font-semibold text-slate-900">{book.title}</p><p className="mt-1 text-xs text-slate-400">ID-{book.id}</p></div></div></td><td className="px-5 py-4 font-mono text-xs text-slate-600">{book.bookId}</td><td className="px-5 py-4">{book.wordCount}</td><td className="px-5 py-4"><div className="flex max-w-[220px] flex-wrap gap-1">{book.tags.length ? book.tags.map((tag) => <span key={tag} className="rounded-full bg-teal-50 px-2.5 py-1 text-xs text-teal-700">{tag}</span>) : <span className="text-slate-400">暂无</span>}</div></td><td className="px-5 py-4 text-slate-500">{new Date(book.updatedAt).toLocaleDateString("zh-CN")}</td><td className="px-5"><div className="flex items-center gap-1"><button onClick={() => { setError(""); setModal(book); }} className="grid size-8 place-items-center rounded-md hover:bg-slate-100" aria-label="编辑单词书"><Pencil size={16} /></button><button onClick={() => remove(book)} disabled={pending} className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label="删除单词书"><Trash2 size={16} /></button><MoreHorizontal size={18} className="ml-1 text-slate-400" /></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t px-5 py-4 text-sm text-slate-500"><span>共 {filtered.length} 本单词书</span><div className="flex gap-1"><button className="grid size-8 place-items-center rounded-md border" aria-label="上一页"><ChevronLeft size={16} /></button><button className="grid size-8 place-items-center rounded-md bg-slate-900 text-white">1</button><button className="grid size-8 place-items-center rounded-md border" aria-label="下一页"><ChevronRight size={16} /></button></div></div></section>
    {error && !modal ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}{filtered.length === 0 ? <div className="mt-10 grid place-items-center"><BookOpen size={28} className="text-slate-300" /></div> : null}
    {modal ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><h2 className="text-xl font-bold">{modal === "create" ? "新建单词书" : "编辑单词书"}</h2><button onClick={() => setModal(null)} aria-label="关闭"><X size={20} /></button></div><form onSubmit={submit} className="grid gap-4">{modal !== "create" ? <input type="hidden" name="id" value={modal.id} /> : null}<Field label="标题"><Input name="title" defaultValue={modal === "create" ? "" : modal.title} required /></Field><Field label="单词数量"><Input name="wordCount" type="number" min="0" defaultValue={modal === "create" ? "0" : modal.wordCount} required /></Field><Field label="封面 URL"><Input name="coverUrl" type="url" defaultValue={modal === "create" ? "https://" : modal.coverUrl} required /></Field><Field label="bookid"><Input name="bookId" defaultValue={modal === "create" ? "" : modal.bookId} required /></Field><Field label="标签（逗号分隔）"><Input name="tags" defaultValue={modal === "create" ? "" : modal.tags.join(", ")} /></Field>{error ? <p className="text-sm text-red-600">{error}</p> : null}<Button disabled={pending}>{pending ? "保存中…" : "保存"}</Button></form></div></div> : null}
  </main>;
}
