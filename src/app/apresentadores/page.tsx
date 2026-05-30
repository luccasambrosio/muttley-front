// src/app/apresentadores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apresentadorService } from "@/services/apresentadorService";
import Modal from "@/components/Modal";
import ApresentadorForm from "@/components/ApresentadorForm";
import { Apresentador, ApresentadorFormData } from "@/types/apresentador";

export default function apresentadoresPage() {
  // 1. Estados da Tela
  const [apresentadores, setApresentadores] = useState<Apresentador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apresentadorSelecionado, setApresentadoreselecionado] = useState<Apresentador | undefined>();

  // 2. Função que busca os dados usando nosso Service
  const carregarApresentadores = async () => {
    try {
      setIsLoading(true);
      const dados = await apresentadorService.listarTodos();
      setApresentadores(dados);
      setErro(null); // Limpa erros se der sucesso
    } catch (error) {
      setErro("Não foi possível carregar a lista de apresentadores.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Executa a busca apenas 1 vez quando a tela abre
  useEffect(() => {
    carregarApresentadores();
  }, []);

  // Abre modal para criação
  const handleNovo = () => {
    setApresentadoreselecionado(undefined);
    setIsModalOpen(true);
  };

  // Abre modal para edição
  const handleEditar = (apresentador: Apresentador) => {
    setApresentadoreselecionado(apresentador);
    setIsModalOpen(true);
  };

  const handleSalvar = async (dados: ApresentadorFormData) => {
    try {
      if (apresentadorSelecionado) {
        await apresentadorService.atualizar(apresentadorSelecionado.id, dados);
      } else {
        await apresentadorService.criar(dados);
      }
      setIsModalOpen(false);
      carregarApresentadores(); // Atualiza a lista após salvar
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  // 4. Lida com a exclusão
  const handleExcluir = async (id: number, nome: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o apresentador ${nome}?`);
    
    if (confirmacao) {
      try {
        await apresentadorService.excluir(id);
        setApresentadores((listaAtual) => listaAtual.filter((apresentador) => apresentador.id !== id));
      } catch (error) {
        alert("Erro ao excluir apresentador. Verifique se o servidor está rodando.");
      }
    }
  };

  // 5. Renderização (Desenhando a tela)
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-muttley-dark">Gestão de Apresentadores</h1>
        <button 
          onClick={handleNovo}
          className="bg-muttley-action text-white px-5 py-2.5 rounded-md font-semibold hover:bg-muttley-dark"
        >
          + Novo Apresentador
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
              {apresentadores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum apresentador cadastrado.
                  </td>
                </tr>
              ) : (
                apresentadores.map((apresentador) => (
                  <tr key={apresentador.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apresentador.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{apresentador.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apresentador.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{apresentador.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditar(apresentador)} className="text-muttley-action hover:text-muttley-dark">Editar</button>
                      <button onClick={() => handleExcluir(apresentador.id, apresentador.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
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
        title={apresentadorSelecionado ? "Editar apresentador" : "Novo apresentador"}
      >
        <ApresentadorForm 
          dadosIniciais={apresentadorSelecionado} 
          aoEnviar={handleSalvar} 
          botaoTexto={apresentadorSelecionado ? "Salvar Alterações" : "Cadastrar apresentador"}
        />
      </Modal>

    </div>
  );
}