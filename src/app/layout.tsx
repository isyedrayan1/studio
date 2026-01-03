import type { Metadata } from "next";
import { Bebas_Neue, Rajdhani } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TournamentProvider } from "@/contexts/tournament-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";

// Bebas Neue - For all headings, nav, sidebars, buttons
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

// Rajdhani - Tech/gaming font for body text
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "FFSAL - Free Fire Students Association League",
  description: "Three-day esports tournament organized by Thinkbotz Association, AIML Dept, Annamacharya Institute of Technology and Sciences, Kadapa-Chennur",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          bebasNeue.variable,
          rajdhani.variable
        )}
      >
        <AuthProvider>
          <TournamentProvider>
            <SidebarProvider>
              <div className="relative flex min-h-screen w-full flex-col">
                <Header />
                <div className="flex flex-1">
                  {children}
                </div>
                <Footer />
              </div>
            </SidebarProvider>
            <Toaster />
            <Analytics />
          </TournamentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
