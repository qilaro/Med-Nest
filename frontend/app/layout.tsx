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
  openGraph: {
    title: 'Med-Nest - Bangladesh Medicine Index',
    description: 'Complete medicine information for Bangladesh including prices, generics, dosage forms, and therapeutic classes.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Med-Nest',
    url: 'https://mednest.com.bd',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://mednest.com.bd' },
  verification: { google: 'YOUR_GOOGLE_SEARCH_CONSOLE_ID' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" className={cn("h-full antialiased", "font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
        <body className="min-h-full flex flex-col font-serif relative" suppressHydrationWarning>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Med-Nest',
            url: 'https://mednest.com.bd',
            description: 'Bangladesh medicine index with prices, generics, and medical information.',
            publisher: { '@type': 'Organization', name: 'Med-Nest' },
          }) }} />
          <script dangerouslySetInnerHTML={{ __html: `
document.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('copy',function(e){e.preventDefault()});
document.addEventListener('dragstart',function(e){e.preventDefault()});
document.addEventListener('keydown',function(e){
  if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))||(e.ctrlKey&&e.key==='U')){
    e.preventDefault();
  }
});
`}} />
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
