"use client";

import { useEffect, useState } from "react";
import { Evento, EventoFormData } from "@/types/evento";
import { eventoService } from "@/services/eventoService";
import Modal from "@/components/Modal";
import EventoForm from "@/components/EventoForm";

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | undefined>();

  const carregarEventos = async () => {
    try {
      setIsLoading(true);
      const dados = await eventoService.listarTodos();
      setEventos(dados);
      setErro(null);
    } catch (error: any) {
      setErro(error.message || "Não foi possível carregar a lista de eventos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const handleNovo = () => {
    setEventoSelecionado(undefined);
    setIsModalOpen(true);
  };

  const handleEditar = (evento: Evento) => {
    setEventoSelecionado(evento);
    setIsModalOpen(true);
  };

  const handleSalvar = async (dados: EventoFormData) => {
    try {
      if (eventoSelecionado) {
        await eventoService.atualizar(eventoSelecionado.id, dados);
      } else {
        await eventoService.criar(dados);
      }
      setIsModalOpen(false);
      carregarEventos(); 
    } catch (error: any) {
      alert(error.message || "Erro ao salvar dados.");
    }
  };

  const handleExcluir = async (id: number, titulo: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o evento "${titulo}"?`);
    
    if (confirmacao) {
      try {
        await eventoService.excluir(id);
        setEventos((listaAtual) => listaAtual.filter((evento) => evento.id !== id));
      } catch (error: any) {
        alert(error.message || "Erro ao excluir evento.");
      }
    }
  };

  const formatarData = (dataSql: string) => {
    if (!dataSql) return "-";
    const [ano, mes, dia] = dataSql.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-muttley-dark">Gestão de Eventos</h1>
        <button 
          onClick={handleNovo}
          className="bg-muttley-action text-white px-5 py-2.5 rounded-md font-semibold hover:bg-muttley-dark transition-colors"
        >
          + Novo Evento
        </button>
      </div>

      {erro && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{erro}</div>}
      
      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Carregando dados...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Início</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum evento cadastrado.
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {evento.titulo}
                      <div className="text-xs text-gray-400 font-normal max-w-xs">{evento.descricao}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(evento.dataInicio)} às {evento.horaInicio?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(evento.dataFim)} às {evento.horaFim?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditar(evento)} className="text-muttley-action hover:text-muttley-dark">Editar</button>
                      <button onClick={() => handleExcluir(evento.id, evento.titulo)} className="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        titulo={eventoSelecionado ? "Editar Evento" : "Novo Evento"}
      >
        <EventoForm 
          dadosIniciais={eventoSelecionado} 
          aoEnviar={handleSalvar} 
          botaoTexto={eventoSelecionado ? "Salvar Alterações" : "Cadastrar Evento"}
        />
      </Modal>

    </div>
  );
}