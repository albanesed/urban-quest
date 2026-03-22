import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import OfflineBanner from "@/components/OfflineBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Urban Quest",
  description: "Esplora la città risolvendo enigmi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} antialiased bg-gray-900 text-white min-h-screen`}
      >
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
