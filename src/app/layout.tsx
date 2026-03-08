import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSafe - Financial Budget Management",
  description: "Financial Budget Management & Purchase Order System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
