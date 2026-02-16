import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "短劇工廠 - AI短劇生成平台",
  description: "企業級AI短視頻一站式生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased bg-gray-50">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
