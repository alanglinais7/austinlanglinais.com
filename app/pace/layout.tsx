import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pace calculator",
  description:
    "Calculate your running pace per mile, kilometer, or any distance.",
};

// Standalone root layout for /pace: a plain white page with default browser
// styling, intentionally NOT importing globals.css, the theme provider, or the
// sidebar. This reproduces the original Cool Running pace calculator exactly.
export default function PaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#FFFFFF", color: "#000000" }}>
        {children}
      </body>
    </html>
  );
}
