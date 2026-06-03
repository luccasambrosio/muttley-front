"use client";

import { useEffect, useMemo, useState } from "react";
import { apresentadorService } from "@/services/apresentadorService";
import Modal from "@/components/Modal";
import ApresentadorForm from "@/components/ApresentadorForm";
import ListToolbar from "@/components/ListToolbar";
import TableRowActions from "@/components/TableRowActions";
import DetailModal, { DetailField } from "@/components/DetailModal";
import { Apresentador, ApresentadorFormData } from "@/types/apresentador";
import { muttleyAlert, muttleyConfirm } from "@/lib/dialog";

export default function ApresentadoresPage() {
  const [apresentadores, setApresentadores] = useState<Apresentador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ordenarAsc, setOrdenarAsc] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apresentadorSelecionado, setApresentadorSelecionado] = useState<Apresentador | undefined>();
  const [detalheAberto, setDetalheAberto] = useState<Apresentador | null>(null);

  const carregarApresentadores = async () => {
    try {
      setIsLoading(true);
      const dados = await apresentadorService.listarTodos();
      setApresentadores(dados);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar a lista de apresentadores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarApresentadores();
  }, []);

  const listaFiltrada = useMemo(() => {
    let lista = [...apresentadores];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (a) =>
          a.nome.toLowerCase().includes(q) ||
          a.telefone?.toLowerCase().includes(q) ||
          a.cpf?.toLowerCase().includes(q)
      );
    }
    lista.sort((a, b) =>
      ordenarAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
    );
    return lista;
  }, [apresentadores, busca, ordenarAsc]);

  const handleNovo = () => {
    setApresentadorSelecionado(undefined);
    setIsModalOpen(true);
  };

  const handleEditar = (apresentador: Apresentador) => {
    setApresentadorSelecionado(apresentador);
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
      carregarApresentadores();
    } catch {
      await muttleyAlert("Erro ao salvar dados.");
    }
  };

  const handleExcluir = async (id: number, nome: string) => {
    if (await muttleyConfirm(`Tem certeza que deseja excluir o apresentador ${nome}?`)) {
      try {
        await apresentadorService.excluir(id);
        setApresentadores((lista) => lista.filter((a) => a.id !== id));
      } catch {
        await muttleyAlert("Erro ao excluir apresentador. Verifique se o servidor está rodando.");
      }
    }
  };

  const camposDetalhe = (a: Apresentador): DetailField[] => [
    { label: "ID", value: a.id },
    { label: "Nome", value: a.nome },
    { label: "Telefone", value: a.telefone },
    { label: "CPF", value: a.cpf },
  ];

  return (
    <div className="page-shell p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão de Apresentadores</h1>
        <button
          onClick={handleNovo}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-blue-700 shrink-0"
        >
          + Novo Apresentador
        </button>
      </div>

      <ListToolbar
        search={busca}
        onSearchChange={setBusca}
        sortAsc={ordenarAsc}
        onSortToggle={() => setOrdenarAsc((v) => !v)}
        placeholder="Buscar por nome, telefone ou CPF..."
        sortLabel="Nome"
      />

      {erro && (
        <div className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 p-4 rounded mb-6 border border-red-200 dark:border-red-900">
          {erro}
        </div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">Carregando dados...</div>
      ) : (
        <div className="table-surface">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nome</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase">Telefone</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase">CPF</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase w-36">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum apresentador encontrado.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((apresentador) => (
                  <tr key={apresentador.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 text-sm font-medium">{apresentador.nome}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {apresentador.telefone}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {apresentador.cpf}
                    </td>
                    <td className="px-4 py-3">
                      <TableRowActions
                        onView={() => setDetalheAberto(apresentador)}
                        onEdit={() => handleEditar(apresentador)}
                        onDelete={() => handleExcluir(apresentador.id, apresentador.nome)}
                      />
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
        title={apresentadorSelecionado ? "Editar apresentador" : "Novo apresentador"}
      >
        <ApresentadorForm
          dadosIniciais={apresentadorSelecionado}
          aoEnviar={handleSalvar}
          botaoTexto={apresentadorSelecionado ? "Salvar Alterações" : "Cadastrar apresentador"}
        />
      </Modal>

      <DetailModal
        isOpen={!!detalheAberto}
        onClose={() => setDetalheAberto(null)}
        title="Detalhes do apresentador"
        fields={detalheAberto ? camposDetalhe(detalheAberto) : []}
      />
    </div>
  );
}
