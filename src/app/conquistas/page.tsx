"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { participanteService } from "@/services/participanteService";
import { inscricaoService } from "@/services/inscricaoService";
import { eventoService } from "@/services/eventoService";
import { muttleyAlert } from "@/lib/dialog";
import { Trophy, Star, Award, Download, Flame } from "lucide-react";

export default function ConquistasPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ id: number; role: string; nome: string } | null>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [inscricoesConcluidas, setInscricoesConcluidas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("muttley_user");
    const token = localStorage.getItem("muttley_token");

    if (userStr && token) {
      const parsedUser = JSON.parse(userStr);
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (parsedUser.role !== "PARTICIPANTE") {
        router.push("/eventos");
        return;
      }
      
      setUsuario({ id: payload.id, role: parsedUser.role, nome: parsedUser.nome });
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const carregarDados = async () => {
    try {
      // 1. Pega os dados do perfil (onde estão os pontos)
      const dadosPerfil = await participanteService.buscarPorId(usuario!.id);
      setPerfil(dadosPerfil);

      // 2. Busca todos os eventos para poder cruzar os dados
      const todosEventos = await eventoService.listarTodos();

      // 3. Pega as inscrições
      const inscricoes = await inscricaoService.listarPorParticipante(usuario!.id);
      
      // 4. Filtra apenas os Concluídos e mescla o objeto evento de forma segura
      const concluidas = inscricoes
        .filter((i: any) => i.status === "CONCLUIDO")
        .map((i: any) => {
          // Descobre o ID do evento, seja como i.evento.id ou i.eventoId
          const eventoId = i.evento?.id || i.eventoId;
          
          // Acha o evento completo na lista que acabamos de baixar
          const eventoEncontrado = todosEventos.find((ev: any) => ev.id === eventoId);
          
          return {
            ...i,
            // Injeta o evento completo. Se não achar, cria um objeto vazio de segurança.
            evento: eventoEncontrado || i.evento || {} 
          };
        });

      setInscricoesConcluidas(concluidas);

    } catch (e) {
      console.error("Erro ao carregar conquistas", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBaixarCertificado = async (inscricaoId: number) => {
    try {
      await inscricaoService.baixarCertificado(inscricaoId);
    } catch (error) {
      await muttleyAlert("Erro ao baixar o certificado.");
    }
  };

  // Cálculo de Gamificação
  const pontos = perfil?.pontosTotais || 0;
  const nivel = Math.floor(pontos / 100) + 1; // A cada 100 pontos sobe de nível
  const progressoLevel = pontos % 100; // Porcentagem para o próximo nível

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="text-center py-20 font-medium text-gray-500">Calculando seu progresso...</div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* CABEÇALHO GAMIFICADO */}
        <div className="bg-linear-to-br from-purple-700 to-blue-600 rounded-3xl p-8 shadow-xl text-white mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          
          <div className="bg-white/20 p-5 rounded-full border-4 border-white/30 backdrop-blur-sm shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-md" />
          </div>
          
          <div className="flex-1 w-full text-center md:text-left z-10">
            <h1 className="text-3xl font-black tracking-tight mb-1">Mural de Conquistas</h1>
            <p className="text-blue-100 font-medium opacity-90 mb-6">Acompanhe seu progresso e certificados acadêmicos</p>
            
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <span className="font-bold">Nível {nivel}</span>
                </div>
                <div className="text-sm font-bold opacity-80">{pontos} / {nivel * 100} XP</div>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-yellow-300 to-yellow-500 h-3 rounded-full transition-all duration-1000 relative" 
                  style={{ width: `${progressoLevel}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="card-surface p-5 rounded-2xl flex flex-col items-center justify-center text-center">
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <span className="text-3xl font-black text-gray-900 dark:text-white">{inscricoesConcluidas.length}</span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Eventos Concluídos</span>
          </div>
          <div className="card-surface p-5 rounded-2xl flex flex-col items-center justify-center text-center">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <span className="text-3xl font-black text-gray-900 dark:text-white">{pontos}</span>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Total de XP</span>
          </div>
        </div>

        {/* GALERIA DE CERTIFICADOS */}
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Seus Certificados
        </h2>

        {inscricoesConcluidas.length === 0 ? (
          <div className="card-surface border-dashed rounded-2xl p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Você ainda não concluiu nenhum evento. Participe de palestras para liberar seus primeiros certificados!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {inscricoesConcluidas.map((insc: any) => (
              <div key={insc.id} className="card-surface rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Award className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  {/* Utilização do operador ? para navegação segura */}
                  <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight mb-2 pr-12">
                    {insc.evento?.titulo || "Evento Indisponível"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Adquirido em: {insc.evento?.dataFim ? insc.evento.dataFim.split("-").reverse().join("/") : "Data Indisponível"}
                  </p>
                  
                  <button 
                    onClick={() => handleBaixarCertificado(insc.id)}
                    className="w-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-purple-200 transition-colors"
                  >
                    <Download className="w-5 h-5" /> Baixar Certificado PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}