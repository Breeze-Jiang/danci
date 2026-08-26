"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(localStorage.getItem("danci-admin") ? "/books" : "/signin");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="size-2 animate-pulse rounded-full bg-teal-500" />
        正在进入词库管理台
      </div>
    </main>
  );
}
