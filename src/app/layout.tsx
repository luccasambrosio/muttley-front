import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // Importando o Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muttley Management",
  description: "Sistema de Gestão FATEC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        {/* O Header fica aqui, fora do {children} */}
        <Header />
        
        {/* O children representa a página que está sendo acessada no momento */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}