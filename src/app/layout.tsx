import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Outfit, Syne } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Cloud Native Atlas",
    template: "%s · Cloud Native Atlas",
  },
  description:
    "Mobile-first map of CNCF tools across the cloud-native stack — learn, compare, and build your stack.",
  applicationName: "Cloud Native Atlas",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CN Atlas",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#070b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full dark`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
