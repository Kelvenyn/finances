import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance Core",
  description: "Financas pessoais e empresariais em um lugar centralizado.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
