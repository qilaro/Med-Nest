import type { Metadata } from "next";
import "./globals.css";
import EmergencyBanner from "@/components/layout/EmergencyBanner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Med-Nest - Learn more. Live better.",
  description: "Med-Nest is your trusted source for comprehensive drug information, interaction checking, and medication guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body className="min-h-full flex flex-col font-serif relative">
        <EmergencyBanner />
        <Header />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
