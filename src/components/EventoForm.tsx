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
    assinaturaDescricao: initialData?.assinaturaDescricao || "",
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
        <label className="field-label">Título do Evento</label>
        <input required type="text" name="titulo" value={formData.titulo} onChange={handleChange}
          className="field-input" />
      </div>

      <div>
        <label className="field-label">Descrição</label>
        <textarea required name="descricao" value={formData.descricao} onChange={handleChange} rows={3}
          className="field-input" />
      </div>

      <div>
        <label className="field-label">Texto da assinatura no certificado</label>
        <input
          required
          type="text"
          name="assinaturaDescricao"
          value={formData.assinaturaDescricao}
          onChange={handleChange}
          placeholder="Ex: Coordenador do curso de Análise e Desenvolvimento de Sistemas"
          className="field-input"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Substitui o texto fixo exibido abaixo da linha de assinatura no PDF.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Data Início</label>
          <input required type="date" name="dataInicio" value={formData.dataInicio} onChange={handleChange}
            className="field-input" />
        </div>
        <div>
          <label className="field-label">Hora Início</label>
          <input required type="time" step="1" name="horaInicio" value={formData.horaInicio} onChange={handleChange}
            className="field-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Data Fim</label>
          <input required type="date" name="dataFim" value={formData.dataFim} onChange={handleChange}
            className="field-input" />
        </div>
        <div>
          <label className="field-label">Hora Fim</label>
          <input required type="time" step="1" name="horaFim" value={formData.horaFim} onChange={handleChange}
            className="field-input" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <label className="field-label">Complexidade (XP)</label>
          <select name="complexidade" value={formData.complexidade} onChange={handleChange}
            className="field-input">
            <option value={1}>1 - Básico</option>
            <option value={2}>2 - Intermediário</option>
            <option value={3}>3 - Avançado</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 mt-5">
          <input type="checkbox" id="requerCheckout" name="requerCheckout" checked={formData.requerCheckout} onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded" />
          <label htmlFor="requerCheckout" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Exige Check-out?
          </label>
        </div>
      </div>

      <div className="card-surface p-3 rounded-lg">
        <label className="field-label mb-2">Apresentadores</label>
        {carregandoApresentadores ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        ) : apresentadoresLista.length === 0 ? (
          <p className="text-sm text-red-500 dark:text-red-400">Nenhum apresentador cadastrado no sistema.</p>
        ) : (
          <div className="max-h-32 overflow-y-auto space-y-2">
            {apresentadoresLista.map((ap) => (
              <label key={ap.id} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                <input type="checkbox" checked={formData.apresentadoresIds.includes(ap.id)} onChange={() => handleApresentadorChange(ap.id)}
                  className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{ap.nome}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
          {isLoading ? "Salvando..." : "Salvar Evento"}
        </button>
      </div>
    </form>
  );
}