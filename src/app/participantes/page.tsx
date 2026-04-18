// src/app/participantes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Participante, ParticipanteFormData } from "@/types/participante";
import { participanteService } from "@/services/participanteService";
import Modal from "@/components/Modal";
import ParticipanteForm from "@/components/ParticipanteForm";

export default function ParticipantesPage() {
  // 1. Estados da Tela
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participanteSelecionado, setParticipanteSelecionado] = useState<Participante | undefined>();

  // 2. Função que busca os dados usando nosso Service
  const carregarParticipantes = async () => {
    try {
      setIsLoading(true);
      const dados = await participanteService.listarTodos();
      setParticipantes(dados);
      setErro(null); // Limpa erros se der sucesso
    } catch (error) {
      setErro("Não foi possível carregar a lista de participantes.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Executa a busca apenas 1 vez quando a tela abre
  useEffect(() => {
    carregarParticipantes();
  }, []);

  // Abre modal para criação
  const handleNovo = () => {
    setParticipanteSelecionado(undefined);
    setIsModalOpen(true);
  };

  // Abre modal para edição
  const handleEditar = (participante: Participante) => {
    setParticipanteSelecionado(participante);
    setIsModalOpen(true);
  };

  const handleSalvar = async (dados: ParticipanteFormData) => {
    try {
      if (participanteSelecionado) {
        await participanteService.atualizar(participanteSelecionado.id, dados);
      } else {
        await participanteService.criar(dados);
      }
      setIsModalOpen(false);
      carregarParticipantes(); // Atualiza a lista após salvar
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  // 4. Lida com a exclusão
  const handleExcluir = async (id: number, nome: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o participante ${nome}?`);
    
    if (confirmacao) {
      try {
        await participanteService.excluir(id);
        // Em vez de recarregar a página, apenas tiramos o participante da lista na tela (mais rápido!)
        setParticipantes((listaAtual) => listaAtual.filter((participante) => participante.id !== id));
      } catch (error) {
        alert("Erro ao excluir participante. Verifique se o servidor está rodando.");
      }
    }
  };

  // 5. Renderização (Desenhando a tela)
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-muttley-dark">Gestão de Participantes</h1>
        <button 
          onClick={handleNovo}
          className="bg-muttley-action text-white px-5 py-2.5 rounded-md font-semibold hover:bg-muttley-dark"
        >
          + Novo Participante
        </button>
      </div>

      {/* Tratamento de Erro e Loading */}
      {erro && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{erro}</div>}
      
      {isLoading ? (
        <div className="text-center text-gray-500 py-10">Carregando dados...</div>
      ) : (
        /* Tabela com os dados */
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participantes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum participante cadastrado.
                  </td>
                </tr>
              ) : (
                participantes.map((participante) => (
                  <tr key={participante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participante.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participante.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participante.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditar(participante)} className="text-muttley-action hover:text-muttley-dark">Editar</button>
                      <button onClick={() => handleExcluir(participante.id, participante.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* O Único Modal que serve para Criar e Editar */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        titulo={participanteSelecionado ? "Editar Participante" : "Novo Participante"}
      >
        <ParticipanteForm 
          dadosIniciais={participanteSelecionado} 
          aoEnviar={handleSalvar} 
          botaoTexto={participanteSelecionado ? "Salvar Alterações" : "Cadastrar Participante"}
        />
      </Modal>

    </div>
  );
}