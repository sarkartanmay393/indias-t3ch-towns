import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TAGLINE = "Find tech company offices across India's biggest cities, on a map.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TechCities — Pune Tech Office Map",
    template: "%s · TechCities",
  },
  description: `TechCities is an interactive map of tech, IT, and startup offices in Pune — ${TAGLINE.toLowerCase()} Bengaluru, Delhi, Kolkata, and Mumbai coming next.`,
  applicationName: "TechCities",
  keywords: [
    "Pune tech companies",
    "Pune IT parks map",
    "tech offices India",
    "Hinjewadi companies",
    "startup map India",
  ],
  openGraph: {
    type: "website",
    siteName: "TechCities",
    title: "TechCities — Pune Tech Office Map",
    description: TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: "TechCities — Pune Tech Office Map",
    description: TAGLINE,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#cc785c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full overflow-hidden antialiased`}
    >
      <body className="flex h-full flex-col overflow-hidden">{children}</body>
    </html>
  );
}
