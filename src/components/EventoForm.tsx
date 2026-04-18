"use client";

import { useState, useEffect } from "react";
import { EventoFormData, Evento } from "@/types/evento";

interface EventoFormProps {
  dadosIniciais?: Evento;
  aoEnviar: (dados: EventoFormData) => void;
  botaoTexto: string;
}

export default function EventoForm({ dadosIniciais, aoEnviar, botaoTexto }: EventoFormProps) {
  const [formData, setFormData] = useState<EventoFormData>({
    titulo: "",
    descricao: "",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
  });

  useEffect(() => {
    if (dadosIniciais) {
      setFormData({
        titulo: dadosIniciais.titulo || "",
        descricao: dadosIniciais.descricao || "",
        dataInicio: dadosIniciais.dataInicio || "",
        horaInicio: dadosIniciais.horaInicio ? dadosIniciais.horaInicio.substring(0, 5) : "", // Ajusta "14:00:00" para "14:00" no input type="time"
        dataFim: dadosIniciais.dataFim || "",
        horaFim: dadosIniciais.horaFim ? dadosIniciais.horaFim.substring(0, 5) : "",
      });
    }
  }, [dadosIniciais]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    // Se o backend exigir os segundos, podemos reformatar a hora aqui: `${formData.horaInicio}:00`
    // Mas o LocalTime do Java geralmente aceita "HH:mm" perfeitamente.
    aoEnviar(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
        <input
          type="text"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-muttley-action focus:border-muttley-action"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          required
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-muttley-action focus:border-muttley-action"
        />
      </div>

      {/* Grid para Início */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
          <input
            type="date"
            name="dataInicio"
            value={formData.dataInicio}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Início</label>
          <input
            type="time"
            name="horaInicio"
            value={formData.horaInicio}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Grid para Fim */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Fim</label>
          <input
            type="date"
            name="dataFim"
            value={formData.dataFim}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Fim</label>
          <input
            type="time"
            name="horaFim"
            value={formData.horaFim}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="bg-muttley-action text-white px-4 py-2 rounded-md font-medium hover:bg-muttley-dark transition-colors"
        >
          {botaoTexto}
        </button>
      </div>
    </form>
  );
}