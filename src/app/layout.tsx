import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skill Creator – Generate Claude Skills",
  description:
    "Generate production-ready Claude Skills for any project stack — interactively, in seconds.",
  openGraph: {
    title: "Skill Creator – Generate Claude Skills",
    description:
      "Generate production-ready Claude Skills for any project stack — interactively, in seconds.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    siteName: "Skill Creator",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
