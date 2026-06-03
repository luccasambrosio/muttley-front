import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { DialogProvider } from "@/components/DialogProvider";
import DialogRegistrar from "@/components/DialogRegistrar";

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
      <body className={`${inter.className} min-h-screen`}>
        <DialogProvider>
          <DialogRegistrar />
          <Header />
          <main>
            {children}
          </main>
        </DialogProvider>
      </body>
    </html>
  );
}