import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { ThemeToggle } from "../components/ThemeToggle";

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
    default: "0010capacity - Developer Portfolio",
    template: "%s | 0010capacity"
  },
  description: "0010capacity의 개발자 포트폴리오 사이트입니다. iOS, Android, 웹 앱 개발과 개인 프로젝트를 소개합니다.",
  keywords: ["developer", "portfolio", "iOS", "Android", "web development", "React", "Next.js", "TypeScript"],
  authors: [{ name: "0010capacity" }],
  creator: "0010capacity",
  publisher: "0010capacity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://0010capacity.github.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://0010capacity.github.io',
    title: '0010capacity - Developer Portfolio',
    description: '0010capacity의 개발자 포트폴리오 사이트입니다. iOS, Android, 웹 앱 개발과 개인 프로젝트를 소개합니다.',
    siteName: '0010capacity Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '0010capacity Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0010capacity - Developer Portfolio',
    description: '0010capacity의 개발자 포트폴리오 사이트입니다. iOS, Android, 웹 앱 개발과 개인 프로젝트를 소개합니다.',
    images: ['/og-image.png'],
    creator: '@0010capacity',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "0010capacity",
              "url": "https://0010capacity.github.io",
              "sameAs": [
                "https://github.com/0010capacity"
              ],
              "jobTitle": "Developer",
              "knowsAbout": [
                "iOS Development",
                "Android Development",
                "Web Development",
                "React",
                "Next.js",
                "TypeScript",
                "Swift",
                "Kotlin"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme="dark"
          storageKey="0010capacity-theme"
        >
          <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <nav className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </nav>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
