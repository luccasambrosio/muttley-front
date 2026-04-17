// src/app/palestrantes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { palestranteService } from "@/services/palestranteService";
import Modal from "@/components/Modal";
import PalestranteForm from "@/components/PalestranteForm";
import { Palestrante, PalestranteFormData } from "@/types/palestrante";

export default function palestrantesPage() {
  // 1. Estados da Tela
  const [palestrantes, setPalestrantes] = useState<Palestrante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [palestranteSelecionado, setPalestranteSelecionado] = useState<Palestrante | undefined>();

  // 2. Função que busca os dados usando nosso Service
  const carregarPalestrantes = async () => {
    try {
      setIsLoading(true);
      const dados = await palestranteService.listarTodos();
      setPalestrantes(dados);
      setErro(null); // Limpa erros se der sucesso
    } catch (error) {
      setErro("Não foi possível carregar a lista de palestrantes.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Executa a busca apenas 1 vez quando a tela abre
  useEffect(() => {
    carregarPalestrantes();
  }, []);

  // Abre modal para criação
  const handleNovo = () => {
    setPalestranteSelecionado(undefined);
    setIsModalOpen(true);
  };

  // Abre modal para edição
  const handleEditar = (palestrante: Palestrante) => {
    setPalestranteSelecionado(palestrante);
    setIsModalOpen(true);
  };

  const handleSalvar = async (dados: PalestranteFormData) => {
    try {
      if (palestranteSelecionado) {
        await palestranteService.atualizar(palestranteSelecionado.id, dados);
      } else {
        await palestranteService.criar(dados);
      }
      setIsModalOpen(false);
      carregarPalestrantes(); // Atualiza a lista após salvar
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  // 4. Lida com a exclusão
  const handleExcluir = async (id: number, nome: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o palestrante ${nome}?`);
    
    if (confirmacao) {
      try {
        await palestranteService.excluir(id);
        setPalestrantes((listaAtual) => listaAtual.filter((palestrante) => palestrante.id !== id));
      } catch (error) {
        alert("Erro ao excluir palestrante. Verifique se o servidor está rodando.");
      }
    }
  };

  // 5. Renderização (Desenhando a tela)
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Palestrantes</h1>
        <button 
          onClick={handleNovo}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700"
        >
          + Novo Palestrante
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {palestrantes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum palestrante cadastrado.
                  </td>
                </tr>
              ) : (
                palestrantes.map((palestrante) => (
                  <tr key={palestrante.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{palestrante.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{palestrante.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{palestrante.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{palestrante.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditar(palestrante)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => handleExcluir(palestrante.id, palestrante.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
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
        titulo={palestranteSelecionado ? "Editar palestrante" : "Novo palestrante"}
      >
        <PalestranteForm 
          dadosIniciais={palestranteSelecionado} 
          aoEnviar={handleSalvar} 
          botaoTexto={palestranteSelecionado ? "Salvar Alterações" : "Cadastrar palestrante"}
        />
      </Modal>

    </div>
  );
}