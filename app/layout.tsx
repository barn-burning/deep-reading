import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "deep-reading",
  description: "읽은 작품을 더 오래 생각하게 만드는 곳",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
