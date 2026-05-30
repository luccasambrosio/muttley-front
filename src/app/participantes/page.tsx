"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { participanteService } from "@/services/participanteService";
import { User, Trash2, Edit, Mail, UserPlus, Phone } from "lucide-react";

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<any[]>([]);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const dados = await participanteService.listarTodos();
    setParticipantes(dados);
  };

  const apagar = async (id: number) => {
    if(confirm("Excluir este participante e todas suas inscrições?")) {
      await participanteService.excluir(id);
      carregar();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" /> Participantes
          </h1>
        </div>

        <div className="grid gap-4">
          {participantes.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {p.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{p.nome}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                    <span className="font-mono text-gray-400">{p.cpf}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => apagar(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}