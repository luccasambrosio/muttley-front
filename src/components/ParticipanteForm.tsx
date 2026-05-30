"use client";

import { useState, useEffect } from "react";
import { Participante, ParticipanteFormData } from "@/types/participante";

interface ParticipanteFormProps {
  dadosIniciais?: Participante; // Se vier, é Edição. Se não, é Cadastro.
  aoEnviar: (dados: ParticipanteFormData) => Promise<void>;
  botaoTexto: string;
}

export default function ParticipanteForm({ dadosIniciais, aoEnviar, botaoTexto }: ParticipanteFormProps) {
  const [formData, setFormData] = useState<ParticipanteFormData>({
    nome: "",
    email: "",
    cpf: "",
    dataNascimento: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se for edição, preenche os campos quando os dados chegarem
  useEffect(() => {
    if (dadosIniciais) {
      setFormData({
        nome: dadosIniciais.nome,
        email: dadosIniciais.email,
        cpf: dadosIniciais.cpf,
        dataNascimento: dadosIniciais.dataNascimento,
      });
    }
  }, [dadosIniciais]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await aoEnviar(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-sm rounded-lg space-y-4 border border-gray-100">
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
        <input
          required
          type="text"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail Institucional</label>
        <input
          required
          type="email"
          className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
          <input
            required
            type="text"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="111.111.111-11"
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nascimento</label>
          <input
            required
            type="date"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={formData.dataNascimento}
            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSubmitting ? "Processando..." : botaoTexto}
        </button>
      </div>
      
    </form>
  );
}