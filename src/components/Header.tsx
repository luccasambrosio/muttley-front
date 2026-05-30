"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LogIn, Shield, GraduationCap, User, Calendar, Users, Award, ScanLine, Trophy } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const atualizarStatus = () => {
      const userStr = localStorage.getItem("muttley_user");
      if (userStr) {
        try {
          setUsuario(JSON.parse(userStr));
        } catch (error) {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    };

    atualizarStatus();
    window.addEventListener("muttley-auth", atualizarStatus);
    return () => window.removeEventListener("muttley-auth", atualizarStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("muttley_token");
    localStorage.removeItem("muttley_user");
    window.dispatchEvent(new Event("muttley-auth"));
    router.push("/login");
  };

  if (!isMounted) return <header className="h-16 bg-white shadow-sm border-b" />;

  const isGerencial = usuario?.role === "ADMIN" || usuario?.role === "GESTOR";

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador", color: "text-red-700 bg-red-50 border-red-200", icon: <Shield className="w-4 h-4 mr-1.5" /> };
      case "GESTOR":
        return { label: "Gestor", color: "text-purple-700 bg-purple-50 border-purple-200", icon: <GraduationCap className="w-4 h-4 mr-1.5" /> };
      case "ALUNO":
        return { label: "Participante", color: "text-blue-700 bg-blue-50 border-blue-200", icon: <User className="w-4 h-4 mr-1.5" /> };
      default:
        return { label: "Participante", color: "text-gray-700 bg-gray-50 border-gray-200", icon: <User className="w-4 h-4 mr-1.5" /> };
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Seção Esquerda: Logo e Links de Navegação */}
          <div className="flex items-center gap-6 flex-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <span className="text-2xl font-black text-blue-600 tracking-tight">Muttley</span>
            </Link>

            {/* Links de navegação baseados em Roles */}
            {isGerencial && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-600">
                <Link href="/eventos" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/eventos" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Calendar className="w-4 h-4" /> Eventos
                </Link>
                <Link href="/participantes" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/participantes" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Users className="w-4 h-4" /> Participantes
                </Link>
                {usuario?.role === "ADMIN" && (
                  <Link href="/apresentadores" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/apresentadores" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                    <Award className="w-4 h-4" /> Apresentadores
                  </Link>
                )}
                <Link href="/checkin" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/checkin" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                  <ScanLine className="w-4 h-4" /> Leitor Check-in
                </Link>
                {usuario?.role === "ADMIN" && (
                  <Link href="/admin" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/admin" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                    <Shield className="w-4 h-4" /> Gestores
                  </Link>
                )}
              </nav>
            )}

            


            {usuario?.role === "ALUNO" && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-600">
                <Link href="/eventos" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/eventos" ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Calendar className="w-4 h-4" /> Eventos
                </Link>
                <Link href="/conquistas" className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${pathname === "/conquistas" ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Trophy className="w-4 h-4" /> Conquistas
                </Link>
              </nav>
            )}
          </div>

          {/* Seção Direita: Perfil e Logout */}
          <div className="flex items-center gap-4 shrink-0">
            {usuario && (
              <div className={`hidden sm:flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getRoleConfig(usuario.role).color}`}>
                {getRoleConfig(usuario.role).icon}
                {getRoleConfig(usuario.role).label}
              </div>
            )}

            {usuario ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden lg:block">
                  Olá, <span className="font-bold text-gray-900">{usuario.nome.split(" ")[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}