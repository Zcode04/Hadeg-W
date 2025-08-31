// ✅ 8. app/layout.tsx
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const font = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
  variable: "--font-tajawal",
  preload: true,
});

export const metadata: Metadata = {
  title: "تطبيق الدردشة",
  description: "تطبيق دردشة حديث مبني بواسطة Next.js 15, Tailwind CSS v4, Shadcn v5 وTypeScript",
  keywords: ["دردشة", "ذكاء اصطناعي", "حسانية", "موريتانيا"],
  authors: [{ name: "Hadeg-W Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={font.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
