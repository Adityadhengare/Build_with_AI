import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/context/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "ScholarSathi — Find scholarships made for you",
  description:
    "Discover government and private scholarships in India based on your education, category, income, and academic performance. Verified official links and AI assistance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#F8F9FF] text-[#0B1C30] antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 w-full pt-[92px]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
