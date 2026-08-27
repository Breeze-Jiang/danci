import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { BooksContent } from "@/components/books-content";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/signin");
  return <AdminShell admin={admin}><BooksContent /></AdminShell>;
}
