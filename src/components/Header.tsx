"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  // Função para verificar se a rota está ativa e mudar a cor do link
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Nome do Projeto */}
          <div className="shrink-0 flex items-center">
            <Logo/>
          </div>

          {/* Navegação Principal */}
          <nav className="flex gap-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-muttley-action" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Home
            </Link>

            <Link 
              href="/participantes" 
              className={`text-sm font-medium transition-colors ${
                isActive("/participantes") ? "text-muttley-action" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Participantes
            </Link>

            <Link 
              href="/apresentadores" 
              className={`text-sm font-medium transition-colors ${
                isActive("/apresentadores") ? "text-muttley-action" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Apresentadores
            </Link>

            <Link 
              href="/eventos" 
              className={`text-sm font-medium transition-colors ${
                isActive("/eventos") ? "text-muttley-action" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Eventos
            </Link>
          </nav>


          <div className="flex gap-x-4">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              FATEC • ADS
            </span>
            <Link
              href="/login"
            >
              <span className="text-sm text-white bg-muttley-action px-2 py-1 rounded">
                Entrar
              </span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}