"use client";

import { useState, useEffect } from "react";
import { EventoFormData } from "@/types/evento";
import { Apresentador } from "@/types/apresentador";
import { apresentadorService } from "@/services/apresentadorService";

interface EventoFormProps {
  initialData?: any;
  onSubmit: (data: EventoFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function EventoForm({ initialData, onSubmit, onCancel, isLoading }: EventoFormProps) {
  const [formData, setFormData] = useState<EventoFormData>({
    titulo: initialData?.titulo || "",
    descricao: initialData?.descricao || "",
    dataInicio: initialData?.dataInicio || "",
    horaInicio: initialData?.horaInicio || "",
    dataFim: initialData?.dataFim || "",
    horaFim: initialData?.horaFim || "",
    complexidade: initialData?.complexidade || 1,
    requerCheckout: initialData?.requerCheckout ?? true,
    apresentadoresIds: initialData?.apresentadores?.map((a: any) => a.id) || [],
  });

  const [apresentadoresLista, setApresentadoresLista] = useState<Apresentador[]>([]);
  const [carregandoApresentadores, setCarregandoApresentadores] = useState(true);

  useEffect(() => {
    async function carregarApresentadores() {
      try {
        const dados = await apresentadorService.listarTodos();
        setApresentadoresLista(dados);
      } catch (error) {
        console.error("Erro ao carregar apresentadores", error);
      } finally {
        setCarregandoApresentadores(false);
      }
    }
    carregarApresentadores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApresentadorChange = (id: number) => {
    setFormData(prev => {
      const idsAtuais = prev.apresentadoresIds;
      if (idsAtuais.includes(id)) {
        return { ...prev, apresentadoresIds: idsAtuais.filter(apId => apId !== id) };
      } else {
        return { ...prev, apresentadoresIds: [...idsAtuais, id] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
        <input required type="text" name="titulo" value={formData.titulo} onChange={handleChange}
          className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea required name="descricao" value={formData.descricao} onChange={handleChange} rows={3}
          className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <input required type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
          <input required type="time" step="1" name="horaInicio" value={formData.horaInicio} onChange={handleChange}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <input required type="date" name="dataFim" value={formData.dataFim} onChange={handleChange}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
          <input required type="time" step="1" name="horaFim" value={formData.horaFim} onChange={handleChange}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center bg-gray-50 p-3 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complexidade (XP)</label>
          <select name="complexidade" value={formData.complexidade} onChange={handleChange}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500">
            <option value={1}>1 - Básico</option>
            <option value={2}>2 - Intermediário</option>
            <option value={3}>3 - Avançado</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 mt-5">
          <input type="checkbox" id="requerCheckout" name="requerCheckout" checked={formData.requerCheckout} onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded" />
          <label htmlFor="requerCheckout" className="text-sm font-medium text-gray-700 cursor-pointer">
            Exige Check-out? (Gera PDF)
          </label>
        </div>
      </div>

      <div className="bg-white p-3 border rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-2">Palestrantes / Apresentadores</label>
        {carregandoApresentadores ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : apresentadoresLista.length === 0 ? (
          <p className="text-sm text-red-500">Nenhum palestrante cadastrado no sistema.</p>
        ) : (
          <div className="max-h-32 overflow-y-auto space-y-2">
            {apresentadoresLista.map((ap) => (
              <label key={ap.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input type="checkbox" checked={formData.apresentadoresIds.includes(ap.id)} onChange={() => handleApresentadorChange(ap.id)}
                  className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{ap.nome}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
          {isLoading ? "Salvando..." : "Salvar Evento"}
        </button>
      </div>
    </form>
  );
}