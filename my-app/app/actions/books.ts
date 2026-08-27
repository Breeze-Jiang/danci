"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { books, words } from "@/lib/db/schema";
import { getCurrentAdmin } from "@/lib/auth";

export type BookActionState = { error?: string; success?: boolean };

function parseBook(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const wordCount = Number(formData.get("wordCount"));
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const bookId = String(formData.get("bookId") || "").trim();
  const tags = [...new Set(String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean))];

  if (!title || !bookId || !coverUrl || !Number.isInteger(wordCount) || wordCount < 0) {
    return { error: "请填写有效的标题、单词数量、封面 URL 和 bookid" } as const;
  }

  try {
    new URL(coverUrl);
  } catch {
    return { error: "封面 URL 格式无效" } as const;
  }

  return { values: { title, wordCount, coverUrl, bookId, tags } } as const;
}

export async function createBook(formData: FormData): Promise<BookActionState> {
  if (!(await getCurrentAdmin())) return { error: "请先登录" };
  const parsed = parseBook(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await db.insert(books).values(parsed.values);
    revalidatePath("/books");
    return { success: true };
  } catch {
    return { error: "创建失败，bookid 可能已存在" };
  }
}

export async function deleteBook(formData: FormData): Promise<BookActionState> {
  if (!(await getCurrentAdmin())) return { error: "请先登录" };
  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) return { error: "单词书 ID 无效" };

  try {
    await db.transaction(async (tx) => {
      const book = await tx.query.books.findFirst({ where: eq(books.id, id), columns: { bookId: true } });
      if (!book) throw new Error("NOT_FOUND");
      await tx.delete(words).where(eq(words.bookId, book.bookId));
      await tx.delete(books).where(eq(books.id, id));
    });
    revalidatePath("/books");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error && error.message === "NOT_FOUND" ? "单词书不存在" : "删除失败" };
  }
}

export async function updateBook(formData: FormData): Promise<BookActionState> {
  if (!(await getCurrentAdmin())) return { error: "请先登录" };
  const id = Number(formData.get("id"));
  const parsed = parseBook(formData);
  if (!Number.isSafeInteger(id) || id < 1 || "error" in parsed) {
    return { error: "提交的单词书数据无效" };
  }

  try {
    const result = await db.update(books)
      .set({ ...parsed.values, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning({ id: books.id });
    if (result.length === 0) return { error: "单词书不存在" };
    revalidatePath("/books");
    return { success: true };
  } catch {
    return { error: "保存失败，bookid 可能已存在" };
  }
}
