"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import EventoForm from "@/components/EventoForm";
import { eventoService } from "@/services/eventoService";
import { inscricaoService } from "@/services/inscricaoService";
import { usuarioService } from "@/services/usuarioService";
import { PlusCircle, Calendar, Edit, Trash2, Ticket } from "lucide-react";

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<{ id: number; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<any | null>(null);

  const [isInscricaoModalOpen, setIsInscricaoModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | null>(null);
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("muttley_token");
    const userStr = localStorage.getItem("muttley_user");
    
    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsuario({ id: payload.id, role: parsedUser.role });
      } catch (e) {
        console.error(e);
      }
    }
    carregarEventos();
  }, []);

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

  const handleParticiparClick = async (eventoId: number) => {
    if (usuario && usuario.role === "ALUNO") {
      try {
        await inscricaoService.inscrever({ participanteId: usuario.id, eventoId });
        alert("Inscrição realizada com sucesso! Verifique seu e-mail.");
        return;
      } catch (error: any) {
        alert(error.data || "Erro ao processar inscrição automática.");
        return;
      }
    }
    
    setEventoSelecionado(eventoId);
    setCpf("");
    setDataNascimento("");
    setIsInscricaoModalOpen(true);
  };

  const confirmarInscricaoDeslogado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado) return;

    try {
      const res = await usuarioService.loginAluno({ cpf, dataNascimento });
      
      localStorage.setItem("muttley_token", res.token);
      localStorage.setItem("muttley_user", JSON.stringify({ nome: res.nome, role: res.role }));

      const payload = JSON.parse(atob(res.token.split('.')[1]));
      
      await inscricaoService.inscrever({ participanteId: payload.id, eventoId: eventoSelecionado });
      
      setUsuario({ id: payload.id, role: res.role });
      
      alert("Inscrição realizada com sucesso! Verifique seu e-mail.");
      setIsInscricaoModalOpen(false);

    } catch (error: any) {
      if (confirm("Seus dados de aluno não foram encontrados. Deseja realizar seu cadastro completo de Participante?")) {
        sessionStorage.setItem("abrir_cadastro_aluno", "true");
        router.push("/login");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Próximos Eventos</h1>
            <p className="text-gray-500 mt-1">Descubra e inscreva-se nas palestras da Fatec.</p>
          </div>
          
          {(usuario?.role === "ADMIN" || usuario?.role === "GESTOR") && (
            <button onClick={() => { setEventoEditando(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center shadow-sm">
              <PlusCircle className="w-5 h-5 mr-2" />
              Novo Evento
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Carregando eventos...</div>
        ) : eventos.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-8 rounded-xl border">Nenhum evento disponível no momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{evento.titulo}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2 bg-gray-50 w-max px-2 py-1 rounded">
                    <Calendar className="w-4 h-4 mr-2" />
                    {evento.dataInicio.split("-").reverse().join("/")} às {evento.horaInicio}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{evento.descricao}</p>
                  
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {evento.apresentadores?.map((ap: any) => (
                        <span key={ap.id} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {ap.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                  {usuario?.role === "ADMIN" || usuario?.role === "GESTOR" ? (
                    <div className="flex justify-end w-full space-x-2">
                      <button onClick={() => { setEventoEditando(evento); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={async () => { if(confirm("Excluir evento?")) { await eventoService.excluir(evento.id); carregarEventos(); } }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleParticiparClick(evento.id)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2">
                      <Ticket className="w-4 h-4" />
                      Participar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} titulo={eventoEditando ? "Editar Evento" : "Criar Evento"}>
          <EventoForm initialData={eventoEditando} onSubmit={async (d) => { eventoEditando ? await eventoService.atualizar(eventoEditando.id, d) : await eventoService.criar(d); setIsModalOpen(false); carregarEventos(); }} onCancel={() => setIsModalOpen(false)} isLoading={false} />
        </Modal>

        <Modal isOpen={isInscricaoModalOpen} onClose={() => setIsInscricaoModalOpen(false)} titulo="Confirmar Inscrição">
          <form onSubmit={confirmarInscricaoDeslogado} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Insira seu CPF e Data de Nascimento para emitir o ingresso.</p>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
              <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} className="w-full p-2 border rounded" placeholder="111.111.111-11" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" required value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 mt-2">
              Gerar Ingresso
            </button>
          </form>
        </Modal>

      </main>
    </div>
  );
}