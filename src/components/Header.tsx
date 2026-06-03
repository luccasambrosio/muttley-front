"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LogIn,
  Shield,
  GraduationCap,
  User,
  Calendar,
  Users,
  Award,
  ScanLine,
  Trophy,
  Menu,
  X,
} from "lucide-react";

function navLinkClass(pathname: string, href: string, activeExtra = "") {
  const active = pathname === href;
  return `px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
    active
      ? `bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 ${activeExtra}`
      : "hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
  }`;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nome: string; role: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const atualizarStatus = () => {
      const userStr = localStorage.getItem("muttley_user");
      if (userStr) {
        try {
          setUsuario(JSON.parse(userStr));
        } catch {
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

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("muttley_token");
    localStorage.removeItem("muttley_user");
    window.dispatchEvent(new Event("muttley-auth"));
    router.push("/login");
  };

  if (!isMounted) {
    return <header className="h-16 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800" />;
  }

  const isGerencial = usuario?.role === "ADMIN" || usuario?.role === "GESTOR";

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "ADMIN":
        return { label: "Administrador", color: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/50 dark:border-red-900", icon: <Shield className="w-4 h-4 mr-1.5" /> };
      case "GESTOR":
        return { label: "Gestor", color: "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-300 dark:bg-purple-950/50 dark:border-purple-900", icon: <GraduationCap className="w-4 h-4 mr-1.5" /> };
      case "PARTICIPANTE":
        return { label: "Participante", color: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-900", icon: <User className="w-4 h-4 mr-1.5" /> };
      default:
        return { label: "Participante", color: "text-gray-700 bg-gray-50 border-gray-200", icon: <User className="w-4 h-4 mr-1.5" /> };
    }
  };

  const linksGerencial = (
    <>
      <Link href="/eventos" className={navLinkClass(pathname, "/eventos")} onClick={() => setMenuAberto(false)}>
        <Calendar className="w-4 h-4" /> Eventos
      </Link>
      <Link href="/participantes" className={navLinkClass(pathname, "/participantes")} onClick={() => setMenuAberto(false)}>
        <Users className="w-4 h-4" /> Participantes
      </Link>
      {usuario?.role === "ADMIN" && (
        <Link href="/apresentadores" className={navLinkClass(pathname, "/apresentadores")} onClick={() => setMenuAberto(false)}>
          <Award className="w-4 h-4" /> Apresentadores
        </Link>
      )}
      <Link href="/checkin" className={navLinkClass(pathname, "/checkin")} onClick={() => setMenuAberto(false)}>
        <ScanLine className="w-4 h-4" /> Leitor Check-in
      </Link>
      {usuario?.role === "ADMIN" && (
        <Link href="/admin" className={navLinkClass(pathname, "/admin")} onClick={() => setMenuAberto(false)}>
          <Shield className="w-4 h-4" /> Gestores
        </Link>
      )}
    </>
  );

  const linksParticipante = (
    <>
      <Link href="/eventos" className={navLinkClass(pathname, "/eventos")} onClick={() => setMenuAberto(false)}>
        <Calendar className="w-4 h-4" /> Eventos
      </Link>
      <Link href="/conquistas" className={navLinkClass(pathname, "/conquistas", "dark:text-purple-400")} onClick={() => setMenuAberto(false)}>
        <Trophy className="w-4 h-4" /> Conquistas
      </Link>
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuAberto((v) => !v)}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            >
              {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">Muttley</span>
            </Link>

            {isGerencial && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300">
                {linksGerencial}
              </nav>
            )}

            {usuario?.role === "PARTICIPANTE" && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-bold text-gray-600 dark:text-gray-300">
                {linksParticipante}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {usuario && (
              <div className={`hidden sm:flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getRoleConfig(usuario.role).color}`}>
                {getRoleConfig(usuario.role).icon}
                {getRoleConfig(usuario.role).label}
              </div>
            )}

            {usuario ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden lg:block">
                  Olá, <span className="font-bold text-gray-900 dark:text-white">{usuario.nome.split(" ")[0]}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden xs:inline">Sair</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
            )}
          </div>
        </div>

        {menuAberto && (isGerencial || usuario?.role === "PARTICIPANTE") && (
          <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 py-3 flex flex-col gap-1 text-sm font-bold text-gray-600 dark:text-gray-300 pb-4">
            {isGerencial ? linksGerencial : linksParticipante}
          </nav>
        )}
      </div>
    </header>
  );
}
