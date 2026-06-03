"use client";

import { useEffect, useMemo, useState } from "react";
import { participanteService } from "@/services/participanteService";
import ListToolbar from "@/components/ListToolbar";
import TableRowActions from "@/components/TableRowActions";
import DetailModal, { DetailField } from "@/components/DetailModal";
import { User } from "lucide-react";
import { muttleyConfirm } from "@/lib/dialog";

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordenarAsc, setOrdenarAsc] = useState(true);
  const [detalheAberto, setDetalheAberto] = useState<any | null>(null);

  const carregar = async () => {
    setIsLoading(true);
    try {
      const dados = await participanteService.listarTodos();
      setParticipantes(dados);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const listaFiltrada = useMemo(() => {
    let lista = [...participantes];
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.cpf?.toLowerCase().includes(q)
      );
    }
    lista.sort((a, b) =>
      ordenarAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)
    );
    return lista;
  }, [participantes, busca, ordenarAsc]);

  const apagar = async (id: number) => {
    if (await muttleyConfirm("Excluir este participante e todas suas inscrições?")) {
      await participanteService.excluir(id);
      carregar();
    }
  };

  const camposDetalhe = (p: any): DetailField[] => [
    { label: "ID", value: p.id },
    { label: "Nome", value: p.nome },
    { label: "E-mail", value: p.email },
    { label: "CPF", value: p.cpf },
    {
      label: "Data de nascimento",
      value: p.dataNascimento
        ? p.dataNascimento.split("-").reverse().join("/")
        : "—",
    },
    { label: "Pontos totais (XP)", value: p.pontosTotais ?? 0 },
  ];

  return (
    <div className="page-shell">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Participantes
        </h1>

        <ListToolbar
          search={busca}
          onSearchChange={setBusca}
          sortAsc={ordenarAsc}
          onSortToggle={() => setOrdenarAsc((v) => !v)}
          placeholder="Buscar por nome, e-mail ou CPF..."
          sortLabel="Nome"
        />

        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">Carregando...</p>
        ) : (
          <div className="table-surface">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nome</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase">E-mail</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium uppercase">CPF</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase w-28">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum participante encontrado.
                    </td>
                  </tr>
                ) : (
                  listaFiltrada.map((p) => (
                    <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-sm font-medium">{p.nome}</td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {p.email}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-sm font-mono text-gray-500 dark:text-gray-400">
                        {p.cpf}
                      </td>
                      <td className="px-4 py-3">
                        <TableRowActions
                          onView={() => setDetalheAberto(p)}
                          onDelete={() => apagar(p.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <DetailModal
          isOpen={!!detalheAberto}
          onClose={() => setDetalheAberto(null)}
          title="Detalhes do participante"
          fields={detalheAberto ? camposDetalhe(detalheAberto) : []}
        />
      </main>
    </div>
  );
}
