import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return {
    metadataBase: new URL(baseUrl),
    title: "太陽系軌道誌｜互動式 3D 行星模型",
    description: "拖曳探索八大行星軌道，調整時間速度並查看行星資料。",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "太陽系軌道誌",
      description: "互動探索八大行星的軌道與資料。",
      images: [{ url: `${baseUrl}/og.png`, width: 1200, height: 630, alt: "太陽系軌道誌" }],
      type: "website",
      locale: "zh_TW",
    },
    twitter: {
      card: "summary_large_image",
      title: "太陽系軌道誌",
      description: "互動探索八大行星的軌道與資料。",
      images: [`${baseUrl}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
