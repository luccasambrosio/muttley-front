"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Função para verificar se a rota está ativa e mudar a cor do link
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Nome do Projeto */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-900">
              Muttley<span className="text-blue-600">Admin</span>
            </Link>
          </div>

          {/* Navegação Principal */}
          <nav className="flex space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/" ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Home
            </Link>

            <Link 
              href="/alunos" 
              className={`text-sm font-medium transition-colors ${
                isActive("/alunos") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Alunos
            </Link>

            <Link 
              href="/palestrantes" 
              className={`text-sm font-medium transition-colors ${
                isActive("/palestrantes") ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Palestrantes
            </Link>
          </nav>

          {/* Info de Perfil (Opcional/Visual) */}
          <div className="hidden sm:block">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              FATEC • ADS
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}