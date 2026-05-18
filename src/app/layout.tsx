import type { Metadata } from "next";
import { Fraunces, Sora, IBM_Plex_Mono, Geist } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-hero",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kshithij Malebennur — Engineer & Builder",
  description:
    "Personal portfolio of Kshithij Malebennur — Mechatronics Engineer at the University of Guelph and Software Engineer at Scotiabank. Frontend, backend, and a fascination with the systems in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${sora.variable} ${plexMono.variable} ${geist.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
