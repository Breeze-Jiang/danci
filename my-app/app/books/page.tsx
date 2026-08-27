import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin-shell";
import { BooksContent } from "@/components/books-content";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/signin");
  const bookRows = await db.select().from(books).orderBy(desc(books.updatedAt));
  return <AdminShell admin={admin}><BooksContent books={bookRows} /></AdminShell>;
}
