import { apiFetch } from "./api";

export const eventoService = {
  listarTodos: (): Promise<any[]> => {
    return apiFetch("/eventos");
  },

  buscarPorId: (id: number | string): Promise<any> => {
    return apiFetch(`/eventos/${id}`);
  },

  criar: (dados: any): Promise<any> => {
    return apiFetch("/eventos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: any): Promise<any> => {
    return apiFetch(`/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/eventos/${id}`, {
      method: "DELETE",
    });
  },

  girarTokenDinamico: (id: number | string): Promise<{ token: string }> => {
    return apiFetch(`/eventos/${id}/girar-token`, {
      method: "PATCH",
    });
  }
};