import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthProvider } from "@/components/auth/AuthProvider";

// Self-hosted via next/font — no render-blocking <link>, no layout shift.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Book Studio AI — Turn Your Knowledge Into a Published Book",
  description:
    "Turn notes, recipes, transcripts, and expertise into a publish-ready book — AI outlining, writing, editing, and publishing for creators, coaches, and experts.",
  keywords: [
    "AI book writing",
    "write a book with AI",
    "self-publishing",
    "AI book generator",
    "book outline generator",
    "cookbook maker",
    "publish a book",
  ],
  openGraph: {
    title: "Book Studio AI — Turn Your Knowledge Into a Published Book",
    description:
      "Turn notes, recipes, transcripts, and expertise into a publish-ready book — AI outlining, writing, editing, and publishing for creators, coaches, and experts.",
    siteName: "Book Studio AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Studio AI — Turn Your Knowledge Into a Published Book",
    description:
      "Turn notes, recipes, transcripts, and expertise into a publish-ready book with AI outlining, writing, editing, and publishing.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
