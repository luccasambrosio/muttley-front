"use client";

import { useEffect, useMemo, useState } from "react";
import { adminService } from "@/services/adminService";
import ListToolbar from "@/components/ListToolbar";
import TableRowActions from "@/components/TableRowActions";
import DetailModal, { DetailField } from "@/components/DetailModal";
import { muttleyAlert, muttleyConfirm } from "@/lib/dialog";
import { ShieldCheck, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [gestores, setGestores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordenarAsc, setOrdenarAsc] = useState(true);
  const [detalheAberto, setDetalheAberto] = useState<any | null>(null);

  const carregarGestores = async () => {
    try {
      const dados = await adminService.listarGestores();
      setGestores(dados);
    } catch {
      await muttleyAlert("Erro ao buscar gestores. Você é um Administrador?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarGestores();
  }, []);

  const listaFiltrada = useMemo(() => {
    let lista = [...gestores];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (g) =>
          g.nome?.toLowerCase().includes(q) ||
          g.email?.toLowerCase().includes(q)
      );
    }
    lista.sort((a, b) =>
      ordenarAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
    );
    return lista;
  }, [gestores, busca, ordenarAsc]);

  const handleAprovar = async (id: number) => {
    if (await muttleyConfirm("Deseja aprovar este Gestor? Ele terá acesso total aos eventos.")) {
      await adminService.aprovar(id);
      carregarGestores();
      setDetalheAberto(null);
    }
  };

  const handleRecusar = async (id: number) => {
    if (await muttleyConfirm("Deseja recusar/excluir este cadastro?")) {
      try {
        await adminService.recusar(id);
        carregarGestores();
        setDetalheAberto(null);
      } catch (error: any) {
        await muttleyAlert(error.data || "Erro ao excluir gestor.");
      }
    }
  };

  const camposDetalhe = (g: any): DetailField[] => [
    { label: "ID", value: g.id },
    { label: "Nome", value: g.nome },
    { label: "E-mail", value: g.email },
    {
      label: "Status",
      value: g.aprovado ? (
        <span className="text-green-700 dark:text-green-400 font-bold">Ativo</span>
      ) : (
        <span className="text-yellow-700 dark:text-yellow-400 font-bold">Pendente</span>
      ),
    },
  ];

  return (
    <div className="page-shell">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6 gap-3">
          <ShieldCheck className="w-8 h-8 text-red-600 dark:text-red-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Painel do Administrador
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Aprove ou recuse solicitações de novos professores (Gestores).
            </p>
          </div>
        </div>

        <ListToolbar
          search={busca}
          onSearchChange={setBusca}
          sortAsc={ordenarAsc}
          onSortToggle={() => setOrdenarAsc((v) => !v)}
          placeholder="Buscar por nome ou e-mail..."
          sortLabel="Nome"
        />

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        ) : (
          <div className="table-surface">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left font-bold text-sm">Nome</th>
                  <th className="hidden md:table-cell p-4 text-left font-bold text-sm">E-mail</th>
                  <th className="hidden md:table-cell p-4 text-left font-bold text-sm">Status</th>
                  <th className="p-4 text-right font-bold text-sm w-28">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((g) => (
                  <tr key={g.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-sm">{g.nome}</td>
                    <td className="hidden md:table-cell p-4 text-gray-600 dark:text-gray-300 text-sm">
                      {g.email}
                    </td>
                    <td className="hidden md:table-cell p-4 text-sm">
                      {g.aprovado ? (
                        <span className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">
                          Ativo
                        </span>
                      ) : (
                        <span className="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded text-xs font-bold">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <TableRowActions
                        onView={() => setDetalheAberto(g)}
                        onDelete={() => handleRecusar(g.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listaFiltrada.length === 0 && (
              <p className="text-center p-8 text-gray-500 dark:text-gray-400">Nenhum gestor encontrado.</p>
            )}
          </div>
        )}

        <DetailModal
          isOpen={!!detalheAberto}
          onClose={() => setDetalheAberto(null)}
          title="Detalhes do gestor"
          fields={detalheAberto ? camposDetalhe(detalheAberto) : []}
          footer={
            detalheAberto && !detalheAberto.aprovado ? (
              <button
                type="button"
                onClick={() => handleAprovar(detalheAberto.id)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" /> Aprovar gestor
              </button>
            ) : undefined
          }
        />
      </main>
    </div>
  );
}
