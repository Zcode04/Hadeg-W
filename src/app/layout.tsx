// app/layout.tsx
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

// استخدام خط Tajawal للدعم العربي الجيد
const font = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "تطبيق الدردشة",
  description: "تطبيق دردشة حديث مبني بواسطة Next.js 15, Tailwind CSS v4, Shadcn v5 وTypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}