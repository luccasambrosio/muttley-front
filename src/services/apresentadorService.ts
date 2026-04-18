import { Apresentador, ApresentadorFormData } from "@/types/apresentador";
import { apiFetch } from "./api";

export const apresentadorService = {
  
  listarTodos: (): Promise<Apresentador[]> => {
    return apiFetch("/apresentadores");
  },

  buscarPorId: (id: number): Promise<Apresentador> => {
    return apiFetch(`/apresentadores/${id}`);
  },

  criar: (dados: ApresentadorFormData): Promise<Apresentador> => {
    return apiFetch("/apresentadores", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: ApresentadorFormData): Promise<Apresentador> => {
    return apiFetch(`/apresentadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/apresentadores/${id}`, {
      method: "DELETE",
    });
  }
};