import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "404 Player - Developer Music Terminal",
  description: "Futuristic dark cyber developer-themed music streaming web application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden bg-bg-primary text-text-primary select-none">
        <PlayerProvider>
          <AppShell>{children}</AppShell>
        </PlayerProvider>
      </body>
    </html>
  );
}
