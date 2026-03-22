import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "./globals.css";
import { theme } from "@/theme";
import SPARedirectHandler from "@/components/SPARedirectHandler";
import { MusicPlayerProvider } from "@/components/MusicPlayerProvider";
import MusicPlayer from "@/components/MusicPlayer";
import { SnowfallProvider } from "@/components/SnowfallProvider";
import SnowfallContainer from "@/components/SnowfallContainer";

export const metadata: Metadata = {
  title: {
    default: "DevCapa",
    template: "%s — DevCapa",
  },
  description: "Developer Portfolio - Apps, Blog, and Projects",
  keywords: ["DevCapa", "Developer", "Portfolio", "Blog", "Apps"],
  authors: [{ name: "DevCapa" }],
  creator: "DevCapa",
  publisher: "DevCapa",
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
    title: "DevCapa",
    description: "Developer Portfolio - Apps, Blog, and Projects",
    siteName: "DevCapa",
  },
  twitter: {
    card: "summary",
    title: "DevCapa",
    description: "Developer Portfolio - Apps, Blog, and Projects",
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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DevCapa",
              alternateName: "Developer Capacity",
              url: "https://0010capacity.github.io",
              author: {
                "@type": "Person",
                name: "DevCapa",
                sameAs: ["https://github.com/0010capacity"],
              },
            }),
          }}
        />
      </head>
      <body className="antialiased" style={{ position: "relative" }}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <SPARedirectHandler />
          <SnowfallProvider>
            <SnowfallContainer />
            <MusicPlayerProvider>
              {children}
              <MusicPlayer />
            </MusicPlayerProvider>
          </SnowfallProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
