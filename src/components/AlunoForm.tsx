"use client";

import { useState, useEffect } from "react";
import { Aluno, AlunoFormData } from "@/types/aluno";
import Link from "next/link";

interface AlunoFormProps {
  dadosIniciais?: Aluno; // Se vier, é Edição. Se não, é Cadastro.
  aoEnviar: (dados: AlunoFormData) => Promise<void>;
  botaoTexto: string;
}

export default function AlunoForm({ dadosIniciais, aoEnviar, botaoTexto }: AlunoFormProps) {
  const [formData, setFormData] = useState<AlunoFormData>({
    nome: "",
    curso: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se for edição, preenche os campos quando os dados chegarem
  useEffect(() => {
    if (dadosIniciais) {
      setFormData({
        nome: dadosIniciais.nome,
        curso: dadosIniciais.curso,
        email: dadosIniciais.email,
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
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">Curso</label>
        <input
          required
          type="text"
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.curso}
          onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">E-mail Institucional</label>
        <input
          required
          type="email"
          className="mt-1 w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="flex justify-center items-center pt-4 gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-2 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {isSubmitting ? "Processando..." : botaoTexto}
        </button>
      </div>
    </form>
  );
}