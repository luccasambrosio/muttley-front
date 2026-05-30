"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LogIn, Shield, GraduationCap, User } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ nome: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Lê o usuário do localStorage apenas após o componente montar (Evita erro de Hydration no Next.js)
  useEffect(() => {
    setIsMounted(true);
    const userStr = localStorage.getItem("muttley_user");
    if (userStr) {
      try {
        setUsuario(JSON.parse(userStr));
      } catch (error) {
        console.error("Erro ao ler dados do usuário:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpa os dados de acesso e manda pro login
    localStorage.removeItem("muttley_token");
    localStorage.removeItem("muttley_user");
    setUsuario(null);
    router.push("/login");
  };

  // Enquanto a tela carrega, mostra um header vazio para não piscar a tela
  if (!isMounted) return <header className="h-16 bg-white shadow-sm border-b" />;

  // Função para desenhar a etiqueta (Badge) correta dependendo do tipo do usuário
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador", color: "text-red-700 bg-red-50 border-red-200", icon: <Shield className="w-4 h-4 mr-1.5" /> };
      case "GESTOR":
        return { label: "Gestor", color: "text-purple-700 bg-purple-50 border-purple-200", icon: <GraduationCap className="w-4 h-4 mr-1.5" /> };
      case "ALUNO":
        return { label: "Aluno", color: "text-blue-700 bg-blue-50 border-blue-200", icon: <User className="w-4 h-4 mr-1.5" /> };
      default:
        return { label: "Participante", color: "text-gray-700 bg-gray-50 border-gray-200", icon: <User className="w-4 h-4 mr-1.5" /> };
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Esquerda: Logo e Badge do Usuário */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl font-black text-blue-600 tracking-tight">Muttley</span>
            </Link>

            {/* Substitui o "FATEC ADS" pela Badge Dinâmica */}
            {usuario ? (
              <div className={`hidden sm:flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getRoleConfig(usuario.role).color}`}>
                {getRoleConfig(usuario.role).icon}
                {getRoleConfig(usuario.role).label}
              </div>
            ) : (
              <div className="hidden sm:block px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-xs font-bold">
                Plataforma de Eventos
              </div>
            )}
          </div>

          {/* Direita: Saudação e Botões */}
          <div className="flex items-center gap-4">
            {usuario ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden md:block">
                  Olá, <span className="font-bold text-gray-900">{usuario.nome.split(" ")[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}