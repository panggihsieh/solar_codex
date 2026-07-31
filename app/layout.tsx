import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.GITHUB_ACTIONS === "true"
  ? "https://panggihsieh.github.io/solar_codex"
  : "https://solar-orbital-atlas-hsieh.hsiehpangg.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "太陽系軌道誌｜互動式 3D 行星模型",
  description: "拖曳探索八大行星軌道，調整時間速度並查看行星資料。",
  icons: {
    icon: `${baseUrl}/favicon.svg`,
    shortcut: `${baseUrl}/favicon.svg`,
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
