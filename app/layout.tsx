import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Amiri, Fragment_Mono as Bitcount_Mono_Single, Rokkitt } from "next/font/google"
import "./globals.css"

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-amiri",
})

const bitcount = Bitcount_Mono_Single({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-bitcount",
})

const rokkitt = Rokkitt({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rokkitt",
})

export const metadata: Metadata = {
  title: "Played – Music Player Skin",
  description:
    "A music player skin for anyone who is feeling nostalgic and wants to interact with their favorite device.",
  generator: "v0.app",
  metadataBase: new URL("https://music.sidhyatikku.com"),
  openGraph: {
    title: "Played – Music Player Skin",
    description:
      "A music player skin for anyone who is feeling nostalgic and wants to interact with their favorite device.",
    url: "https://music.sidhyatikku.com",
    siteName: "Played",
    images: [
      {
        url: "/og-image.png",
        width: 1920,
        height: 1080,
        alt: "Played - Nostalgic music player skins including iPod Classic and Sony Walkman",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Played – Music Player Skin",
    description:
      "A music player skin for anyone who is feeling nostalgic and wants to interact with their favorite device.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${amiri.variable} ${bitcount.variable} ${rokkitt.variable}`}>
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
