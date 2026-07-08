import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  keywords: ["Base", "Base builder", "onchain", "dApp", "wallet"],
  metadataBase: new URL("https://base-guestbook.vercel.app"),
  title: "Base Guestbook",
  // Base builder identity: project-level proof uses Build ID, Builder Wallet, Vercel Live Demo, and GitHub repository.
  description:
    "Leave a short message on Base and add your name to a public onchain guestbook built for mobile sharing.",
};

const baseAppId =
  process.env.NEXT_PUBLIC_BASE_APP_ID ?? "6a031502f8601f8d21fe6b66";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
