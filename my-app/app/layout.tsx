import type { Metadata } from "next";
import { Geist, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({ variable: "--font-noto-sc", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "拾词 · 管理台",
  description: "单词书与管理员管理系统",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${notoSansSC.variable}`}>
      <body>{children}</body>
    </html>
  );
}
