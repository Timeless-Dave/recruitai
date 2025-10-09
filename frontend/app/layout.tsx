import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { StructuredData } from "@/components/structured-data"

export const metadata: Metadata = {
  metadataBase: new URL('https://recruitai.app'),
  title: {
    default: "RecruitAI - Smart AI-Powered Recruitment Platform",
    template: "%s | RecruitAI"
  },
  description:
    "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback. Find top talent faster with our smart recruitment platform.",
  keywords: [
    "AI recruitment",
    "applicant tracking system",
    "ATS software",
    "AI hiring platform",
    "applicant screening",
    "recruitment automation",
    "talent acquisition",
    "smart hiring",
    "AI candidate screening",
    "recruitment technology",
    "hiring software",
    "HR automation",
    "applicant ranking"
  ],
  authors: [{ name: "RecruitAI Team" }],
  creator: "RecruitAI",
  publisher: "RecruitAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://recruitai.app",
    title: "RecruitAI - Smart AI-Powered Recruitment Platform",
    description: "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback. Find top talent faster.",
    siteName: "RecruitAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RecruitAI - AI-Powered Recruitment Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RecruitAI - Smart AI-Powered Recruitment Platform",
    description: "Transform hiring with AI-powered applicant screening, intelligent ranking, and automated feedback.",
    images: ["/og-image.png"],
    creator: "@recruitai",
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
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <StructuredData />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
