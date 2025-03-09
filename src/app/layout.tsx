import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/providers/Providers";
import FloatingChatbot from "@/components/FloatingChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quasar - AI Crypto Analysis on Sonic Blockchain",
  description: "AI-powered crypto market analysis dapp built on Sonic Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white`}
      >
        <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <Providers>
          <WalletProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8 fade-in">
                {children}
              </main>
              <Footer />
              <FloatingChatbot />
            </div>
          </WalletProvider>
        </Providers>
      </body>
    </html>
  );
}
