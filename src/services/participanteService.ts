import { Participante, ParticipanteFormData } from "@/types/participante";
import { apiFetch } from "./api";

export const participanteService = {
  
  listarTodos: (): Promise<Participante[]> => {
    return apiFetch("/participantes");
  },

  buscarPorId: (id: number): Promise<Participante> => {
    return apiFetch(`/participantes/${id}`);
  },

  criar: (dados: ParticipanteFormData): Promise<Participante> => {
    return apiFetch("/participantes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: ParticipanteFormData): Promise<Participante> => {
    return apiFetch(`/participantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/participantes/${id}`, {
      method: "DELETE",
    });
  },
};