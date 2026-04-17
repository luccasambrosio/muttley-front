// src/app/alunos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Aluno, AlunoFormData } from "@/types/aluno";
import { alunoService } from "@/services/alunoService";
import Modal from "@/components/Modal";
import AlunoForm from "@/components/AlunoForm";

export default function AlunosPage() {
  // 1. Estados da Tela
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | undefined>();

  // 2. Função que busca os dados usando nosso Service
  const carregarAlunos = async () => {
    try {
      setIsLoading(true);
      const dados = await alunoService.listarTodos();
      setAlunos(dados);
      setErro(null); // Limpa erros se der sucesso
    } catch (error) {
      setErro("Não foi possível carregar a lista de alunos.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Executa a busca apenas 1 vez quando a tela abre
  useEffect(() => {
    carregarAlunos();
  }, []);

  // Abre modal para criação
  const handleNovo = () => {
    setAlunoSelecionado(undefined);
    setIsModalOpen(true);
  };

  // Abre modal para edição
  const handleEditar = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setIsModalOpen(true);
  };

  const handleSalvar = async (dados: AlunoFormData) => {
    try {
      if (alunoSelecionado) {
        await alunoService.atualizar(alunoSelecionado.id, dados);
      } else {
        await alunoService.criar(dados);
      }
      setIsModalOpen(false);
      carregarAlunos(); // Atualiza a lista após salvar
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  // 4. Lida com a exclusão
  const handleExcluir = async (id: number, nome: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir o aluno ${nome}?`);
    
    if (confirmacao) {
      try {
        await alunoService.excluir(id);
        // Em vez de recarregar a página, apenas tiramos o aluno da lista na tela (mais rápido!)
        setAlunos((listaAtual) => listaAtual.filter((aluno) => aluno.id !== id));
      } catch (error) {
        alert("Erro ao excluir aluno. Verifique se o servidor está rodando.");
      }
    }
  };

  // 5. Renderização (Desenhando a tela)
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Alunos</h1>
        <button 
          onClick={handleNovo}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700"
        >
          + Novo Aluno
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum aluno cadastrado.
                  </td>
                </tr>
              ) : (
                alunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aluno.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{aluno.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aluno.curso}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aluno.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleEditar(aluno)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                      <button onClick={() => handleExcluir(aluno.id, aluno.nome)} className="text-red-600 hover:text-red-900">Excluir</button>
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
        titulo={alunoSelecionado ? "Editar Aluno" : "Novo Aluno"}
      >
        <AlunoForm 
          dadosIniciais={alunoSelecionado} 
          aoEnviar={handleSalvar} 
          botaoTexto={alunoSelecionado ? "Salvar Alterações" : "Cadastrar Aluno"}
        />
      </Modal>

    </div>
  );
}