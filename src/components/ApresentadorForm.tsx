"use client";

import { useState, useEffect } from "react";
import { Apresentador, ApresentadorFormData } from "@/types/apresentador";

interface ApresentadorFormProps {
  dadosIniciais?: Apresentador; // Se vier, é Edição. Se não, é Cadastro.
  aoEnviar: (dados: ApresentadorFormData) => Promise<void>;
  botaoTexto: string;
}

export default function ApresentadorForm({ dadosIniciais, aoEnviar, botaoTexto }: ApresentadorFormProps) {
  const [formData, setFormData] = useState<ApresentadorFormData>({
    nome: "",
    telefone: "",
    cpf: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se for edição, preenche os campos quando os dados chegarem
  useEffect(() => {
    if (dadosIniciais) {
      setFormData({
        nome: dadosIniciais.nome,
        telefone: dadosIniciais.telefone,
        cpf: dadosIniciais.cpf,
      });
    }
  }, [dadosIniciais]);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await aoEnviar(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg space-y-4 border border-gray-100">
      <div>
        <label className="block text-sm font-semibold text-gray-700">Nome Completo</label>
        <input
          required
          type="text"
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-muttley-action outline-none"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">Telefone</label>
        <input
          required
          type="text"
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-muttley-action outline-none"
          value={formData.telefone}
          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">CPF</label>
        <input
          required
          type="cpf"
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-muttley-action outline-none"
          value={formData.cpf}
          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
        />
      </div>

      <div className="flex justify-center items-center pt-4 gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-muttley-action text-white px-2 py-2 rounded-md font-bold hover:bg-muttley-dark transition-colors disabled:bg-muttley-light"
        >
          {isSubmitting ? "Processando..." : botaoTexto}
        </button>
      </div>
    </form>
  );
}