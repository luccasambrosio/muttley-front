"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import EventoForm from "@/components/EventoForm";
import { eventoService } from "@/services/eventoService";
import { inscricaoService } from "@/services/inscricaoService";
import { usuarioService } from "@/services/usuarioService";
import { muttleyAlert, muttleyConfirm } from "@/lib/dialog";
import ListToolbar from "@/components/ListToolbar";
import { PlusCircle, Calendar, Edit, Trash2, Ticket, Users, QrCode, CheckCircle, Smartphone, Download } from "lucide-react";

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<{ id: number; role: string; cpf?: string } | null>(null);
  
  // Agora guardamos o objeto completo da Inscrição (para ler o STATUS)
  const [inscricoesMap, setInscricoesMap] = useState<Record<number, any>>({});
  const [loadingEventId, setLoadingEventId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<any | null>(null);

  const [isInscricaoModalOpen, setIsInscricaoModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [busca, setBusca] = useState("");
  const [ordenarAsc, setOrdenarAsc] = useState(true);

  const eventosFiltrados = useMemo(() => {
    let lista = [...eventos];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (e) =>
          e.titulo?.toLowerCase().includes(q) ||
          e.descricao?.toLowerCase().includes(q) ||
          e.gestorCriadorNome?.toLowerCase().includes(q) ||
          e.apresentadores?.some((a: any) => a.nome?.toLowerCase().includes(q))
      );
    }
    lista.sort((a, b) => {
      const da = a.dataInicio || "";
      const db = b.dataInicio || "";
      return ordenarAsc ? da.localeCompare(db) : db.localeCompare(da);
    });
    return lista;
  }, [eventos, busca, ordenarAsc]);

  const verificarSessao = () => {
    const token = localStorage.getItem("muttley_token");
    const userStr = localStorage.getItem("muttley_user");
    
    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuario({ id: payload.id, role: parsedUser.role, cpf: payload.sub });
      } catch (e) {
        setUsuario(null);
      }
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    verificarSessao();
    carregarEventos();

    window.addEventListener("muttley-auth", verificarSessao);
    return () => window.removeEventListener("muttley-auth", verificarSessao);
  }, []);

  useEffect(() => {
    if (usuario?.role === "PARTICIPANTE") {
      carregarInscricoes(usuario.id);
    } else {
      setInscricoesMap({});
    }
  }, [usuario]);

  const carregarEventos = async () => {
    try {
      const dados = await eventoService.listarTodos();
      setEventos(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const carregarInscricoes = async (participanteId: number) => {
    try {
      const dados = await inscricaoService.listarPorParticipante(participanteId);
      const map: Record<number, any> = {};
      dados.forEach((insc: any) => {
        const evId = insc.evento?.id || insc.eventoId;
        map[evId] = insc; // Salva toda a inscrição (id, status, etc) na chave do Evento
      });
      setInscricoesMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const handleParticiparClick = async (eventoId: number) => {
    if (usuario && usuario.role === "PARTICIPANTE") {
      setLoadingEventId(eventoId); 
      try {
        await inscricaoService.inscrever({ participanteId: usuario.id, eventoId });
        await carregarInscricoes(usuario.id); 
        await carregarEventos();
      } catch (error: any) {
        await muttleyAlert(error.data || "Erro ao processar inscrição.");
      } finally {
        setLoadingEventId(null); 
      }
      return;
    }
    
    setEventoSelecionado(eventoId);
    setCpf("");
    setDataNascimento("");
    setIsInscricaoModalOpen(true);
  };

  const handleCancelarInscricao = async (eventoId: number) => {
    if (!usuario) return;
    if (await muttleyConfirm("Deseja realmente cancelar sua inscrição neste evento?")) {
      setLoadingEventId(eventoId); 
      try {
        await inscricaoService.cancelar(eventoId, usuario.id);
        await carregarInscricoes(usuario.id); 
        await carregarEventos();
      } catch (error: any) {
        await muttleyAlert(error.data || "Erro ao cancelar inscrição.");
      } finally {
        setLoadingEventId(null);
      }
    }
  };

  const handleBaixarCertificado = async (inscricaoId: number, eventoId: number) => {
    setLoadingEventId(eventoId);
    try {
      await inscricaoService.baixarCertificado(inscricaoId);
    } catch (error: any) {
      await muttleyAlert("Erro ao baixar o certificado.");
    } finally {
      setLoadingEventId(null);
    }
  };

  const confirmarInscricaoDeslogado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado) return;

    setLoadingEventId(eventoSelecionado);
    let tokenSilencioso = "";
    let participanteId = 0;

    try {
      const res = await usuarioService.loginParticipante({ cpf, dataNascimento });
      tokenSilencioso = res.token;
      const payload = JSON.parse(atob(tokenSilencioso.split('.')[1]));
      participanteId = payload.id;
    } catch (error: any) {
      if (await muttleyConfirm("Seus dados de participante não foram encontrados. Deseja realizar seu cadastro completo?")) {
        sessionStorage.setItem("abrir_cadastro_participante", "true");
        router.push("/login");
      }
      setLoadingEventId(null);
      return;
    }

    try {
      await inscricaoService.inscrever({ participanteId, eventoId: eventoSelecionado }, tokenSilencioso);
      await muttleyAlert("Inscrição confirmada! Seu comprovante foi enviado por e-mail.");
      setIsInscricaoModalOpen(false);
      await carregarEventos();
    } catch (error: any) {
      await muttleyAlert(error.data || "Erro ao realizar inscrição.");
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleExcluirEvento = async (eventoId: number) => {
    if (await muttleyConfirm("Excluir evento?")) {
      await eventoService.excluir(eventoId);
      carregarEventos();
    }
  };

  return (
    <div className="page-shell">
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Próximos Eventos</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Descubra e inscreva-se nas palestras da Fatec.</p>
          </div>
          
          {(usuario?.role === "ADMIN" || usuario?.role === "GESTOR") && (
            <button onClick={() => { setEventoEditando(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center shadow-sm">
              <PlusCircle className="w-5 h-5 mr-2" /> Novo Evento
            </button>
          )}
        </div>

        <ListToolbar
          search={busca}
          onSearchChange={setBusca}
          sortAsc={ordenarAsc}
          onSortToggle={() => setOrdenarAsc((v) => !v)}
          placeholder="Buscar eventos, gestor ou apresentador..."
          sortLabel="Data"
        />

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400 font-medium">Carregando eventos...</div>
        ) : eventosFiltrados.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 card-surface p-8 rounded-xl">
            {eventos.length === 0 ? "Nenhum evento disponível no momento." : "Nenhum evento corresponde à busca."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventosFiltrados.map((evento) => {
              const inscricao = inscricoesMap[evento.id];
              const isInscrito = !!inscricao;
              const isThisLoading = loadingEventId === evento.id;

              return (
                <div key={evento.id} className="card-surface rounded-xl overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={evento.titulo}>{evento.titulo}</h3>
                      
                      {(usuario?.role === "ADMIN" || usuario?.role === "GESTOR") && (
                        <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                          <span>{evento.totalInscritos ?? 0}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* LABELS INTELIGENTES DE STATUS DA INSCRIÇÃO */}
                    {isInscrito && (
                      <div className="mb-3 flex flex-col gap-1 items-start">
                        {inscricao.status === "CONCLUIDO" && (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-bold border border-purple-200">
                            <CheckCircle className="w-3 h-3" /> Certificado Disponível
                          </span>
                        )}
                        {inscricao.status === "CHECK_IN_REALIZADO" && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-200">
                            <CheckCircle className="w-3 h-3" /> Check-in Realizado
                          </span>
                        )}
                        {inscricao.status === "INSCRITO" && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200">
                            <CheckCircle className="w-3 h-3" /> Inscrito
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-200 mb-2 bg-gray-50 dark:bg-gray-800 w-max px-2 py-1 rounded">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" />
                      {evento.dataInicio.split("-").reverse().join("/")} às {evento.horaInicio}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{evento.descricao}</p>

                    {evento.gestorCriadorNome && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-bold text-gray-700 dark:text-gray-200">Gestor:</span>{" "}
                        {evento.gestorCriadorNome}
                      </p>
                    )}
                    {evento.apresentadores?.length > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        <span className="font-bold text-gray-700 dark:text-gray-200">Apresentadores:</span>{" "}
                        {evento.apresentadores.map((a: any) => a.nome).join(", ")}
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex justify-between items-center">
                    {usuario?.role === "ADMIN" || usuario?.role === "GESTOR" ? (
                      <div className="flex justify-between items-center w-full">
                        {evento.requerCheckout ? (
                          <button 
                            onClick={() => router.push(`/eventos/${evento.id}/checkout`)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg border border-purple-100 dark:border-purple-800 flex items-center gap-1 text-xs font-bold transition-colors"
                          >
                            <QrCode className="w-4 h-4" /> Check-out
                          </button>
                        ) : (
                          <div className="text-xs text-gray-400 dark:text-gray-500 italic">Sem checkout</div>
                        )}

                        <div className="flex space-x-2">
                          <button onClick={() => { setEventoEditando(evento); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleExcluirEvento(evento.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      isInscrito ? (
                        inscricao.status === "CONCLUIDO" ? (
                          <button 
                            onClick={() => handleBaixarCertificado(inscricao.id, evento.id)} 
                            disabled={isThisLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <Download className="w-4 h-4" /> {isThisLoading ? "Baixando..." : "Baixar Certificado"}
                          </button>
                        ) : (
                          <div className="flex w-full gap-2">
                            
                            <button 
                              onClick={() => handleCancelarInscricao(evento.id)} 
                              disabled={isThisLoading}
                              className="flex-1 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold py-2 px-3 rounded-lg flex justify-center items-center gap-1 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                            >
                              {isThisLoading ? "..." : "Cancelar"}
                            </button>
                          </div>
                        )
                      ) : (
                        <button 
                          onClick={() => handleParticiparClick(evento.id)} 
                          disabled={isThisLoading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <Ticket className="w-4 h-4" /> {isThisLoading ? "Aguarde..." : "Participar"}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={eventoEditando ? "Editar Evento" : "Criar Evento"}>
          <EventoForm initialData={eventoEditando} onSubmit={async (d) => { eventoEditando ? await eventoService.atualizar(eventoEditando.id, d) : await eventoService.criar(d); setIsModalOpen(false); carregarEventos(); }} onCancel={() => setIsModalOpen(false)} isLoading={false} />
        </Modal>

        <Modal isOpen={isInscricaoModalOpen} onClose={() => setIsInscricaoModalOpen(false)} title="Confirmar Inscrição">
          <form onSubmit={confirmarInscricaoDeslogado} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Insira seu CPF e Data de Nascimento para participar do evento</p>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
              <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} className="field-input" placeholder="111.111.111-11" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" required value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="field-input" />
            </div>
            <button type="submit" disabled={loadingEventId !== null} className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 mt-2 disabled:bg-green-400">
              {loadingEventId !== null ? "Processando..." : "Participar do evento"}
            </button>
          </form>
        </Modal>

          </main>
    </div>
  );
}