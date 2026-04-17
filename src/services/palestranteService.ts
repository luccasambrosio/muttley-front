import { Palestrante, PalestranteFormData } from "@/types/palestrante";
import { apiFetch } from "./api";

export const palestranteService = {
  
  listarTodos: (): Promise<Palestrante[]> => {
    return apiFetch("/palestrantes");
  },

  buscarPorId: (id: number): Promise<Palestrante> => {
    return apiFetch(`/palestrantes/${id}`);
  },

  criar: (dados: PalestranteFormData): Promise<Palestrante> => {
    return apiFetch("/palestrantes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: PalestranteFormData): Promise<Palestrante> => {
    return apiFetch(`/palestrantes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/palestrantes/${id}`, {
      method: "DELETE",
    });
  }
};