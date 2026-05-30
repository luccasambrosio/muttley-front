"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { adminService } from "@/services/adminService";
import { ShieldCheck, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [gestores, setGestores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const carregarGestores = async () => {
    try {
      const dados = await adminService.listarGestores();
      setGestores(dados);
    } catch (error) {
      alert("Erro ao buscar gestores. Você é um Administrador?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { carregarGestores(); }, []);

  const handleAprovar = async (id: number) => {
    if (confirm("Deseja aprovar este Gestor? Ele terá acesso total aos eventos.")) {
      await adminService.aprovar(id);
      carregarGestores();
    }
  };

  const handleRecusar = async (id: number) => {
    if (confirm("Deseja recusar/excluir este cadastro?")) {
      await adminService.recusar(id);
      carregarGestores();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8 gap-3">
          <ShieldCheck className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel do Administrador</h1>
            <p className="text-gray-500">Aprove ou recuse solicitações de novos professores (Gestores).</p>
          </div>
        </div>

        {isLoading ? <p>Carregando...</p> : (
          <div className="bg-white shadow-sm rounded-xl overflow-hidden border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-bold text-gray-700">Nome</th>
                  <th className="p-4 font-bold text-gray-700">E-mail</th>
                  <th className="p-4 font-bold text-gray-700">Status</th>
                  <th className="p-4 font-bold text-gray-700 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gestores.map(g => (
                  <tr key={g.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{g.nome}</td>
                    <td className="p-4 text-gray-600">{g.email}</td>
                    <td className="p-4">
                      {g.aprovado ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Ativo</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Pendente</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {!g.aprovado && (
                        <button onClick={() => handleAprovar(g.id)} className="p-2 text-green-600 hover:bg-green-100 rounded transition" title="Aprovar">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => handleRecusar(g.id)} className="p-2 text-red-600 hover:bg-red-100 rounded transition" title="Recusar">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gestores.length === 0 && <p className="text-center p-8 text-gray-500">Nenhum gestor cadastrado.</p>}
          </div>
        )}
      </main>
    </div>
  );
}