import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BGMI Point Table Maker",
  description: "Manage BGMI tournaments with live leaderboards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


