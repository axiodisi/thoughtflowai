import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThoughtFlow AI",
  description: "Refine your stream of consciousness into clear communication",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1", // Add it here in metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
