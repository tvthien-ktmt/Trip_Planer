import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import QueryProvider from "../providers/QueryProvider";
import { Toaster } from "sonner";
import { LoginModal } from "../components/auth/LoginModal";

export const metadata: Metadata = {
  title: "TripPlaner OTA — Đặt vé máy bay & Tour du lịch",
  description: "Nền tảng đặt vé máy bay và tour du lịch trực tuyến hàng đầu Việt Nam. Giá tốt nhất, dịch vụ 24/7, an toàn và bảo mật.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <QueryProvider>
          {children}
          <LoginModal />
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
