import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SPARedirectHandler from "@/components/SPARedirectHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "이정원",
    template: "%s — 이정원",
  },
  description: "이정원의 개인 공간입니다.",
  keywords: ["이정원", "개발자", "소설", "블로그", "앱"],
  authors: [{ name: "이정원" }],
  creator: "이정원",
  publisher: "이정원",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://0010capacity.github.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://0010capacity.github.io",
    title: "이정원",
    description: "이정원의 개인 공간입니다.",
    siteName: "이정원",
  },
  twitter: {
    card: "summary",
    title: "이정원",
    description: "이정원의 개인 공간입니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "이정원",
              alternateName: "LEE JEONG WON",
              url: "https://0010capacity.github.io",
              sameAs: ["https://github.com/0010capacity"],
              jobTitle: "Developer",
              knowsAbout: [
                "iOS Development",
                "Android Development",
                "Web Development",
                "TypeScript",
                "Swift",
                "Kotlin",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-100`}
      >
        <SPARedirectHandler />
        {children}
      </body>
    </html>
  );
}
