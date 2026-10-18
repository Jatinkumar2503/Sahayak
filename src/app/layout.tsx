import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sahayak-tan-zeta.vercel.app"),
  title: {
    default: "Sahayak 3D | Real-Time 3D Rail Journey & Disruption Simulator",
    template: "%s | Sahayak 3D",
  },
  description:
    "An accessible, real-time 3D low-poly Indian rail corridor companion for passenger journeys and instant disruption decision making.",
  keywords: [
    "Sahayak",
    "Indian Railways",
    "React Three Fiber",
    "3D Rail Journey",
    "Railway Disruption Simulator",
    "Accessibility",
    "Next.js",
    "Okabe-Ito Colorblind Safe",
  ],
  authors: [{ name: "Sahayak Creative Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Sahayak 3D | Real-Time 3D Rail Journey & Disruption Simulator",
    description:
      "An accessible, real-time 3D low-poly Indian rail corridor companion for passenger journeys and instant disruption decision making.",
    url: "/",
    siteName: "Sahayak 3D",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sahayak 3D - Low-poly Indian Rail Journey Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahayak 3D | Real-Time 3D Rail Journey & Disruption Simulator",
    description:
      "An accessible, real-time 3D low-poly Indian rail corridor companion for passenger journeys and instant disruption decision making.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
