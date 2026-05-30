import { apiFetch } from "./api";

export const inscricaoService = {
  inscrever: (dados: { participanteId: number; eventoId: number }): Promise<any> => {
    return apiFetch("/inscricoes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  }
};