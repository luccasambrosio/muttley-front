import { Evento, EventoFormData } from "@/types/evento";
import { apiFetch } from "./api";

export const eventoService = {
  listarTodos: (): Promise<Evento[]> => {
    return apiFetch("/eventos");
  },

  buscarPorId: (id: number): Promise<Evento> => {
    return apiFetch(`/eventos/${id}`);
  },

  criar: (dados: EventoFormData): Promise<Evento> => {
    return apiFetch("/eventos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: EventoFormData): Promise<Evento> => {
    return apiFetch(`/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/eventos/${id}`, {
      method: "DELETE",
    });
  }
};