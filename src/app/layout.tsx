import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { MqttProviderWrapper } from "@/shared/components/mqtt";
import { GlobalNotificationsToasts } from "@/shared/components/notifications/global-notifications-toasts";
import { AuthLoadingProvider } from "@/shared/context/auth-loading-provider";
import { QueryProvider } from "@/shared/context/query-provider";
import { ThemeProvider } from "@/shared/context/theme-provider";
import { ToastProvider } from "@/shared/context/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Viesglo",
    template: "%s | Viesglo",
  },
  description: "Panel de administración de Viesglo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <MqttProviderWrapper enableDebugLogging={process.env.NODE_ENV === "development"}>
              {children}
              <AuthLoadingProvider />
              <ToastProvider />
              <GlobalNotificationsToasts />
            </MqttProviderWrapper>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
