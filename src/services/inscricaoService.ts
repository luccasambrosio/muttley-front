import { apiFetch } from "./api";

export const inscricaoService = {
  inscrever: (dados: { participanteId: number; eventoId: number }, tokenDeUsoUnico?: string): Promise<any> => {
    const options: RequestInit = { method: "POST", body: JSON.stringify(dados) };
    if (tokenDeUsoUnico) options.headers = { Authorization: `Bearer ${tokenDeUsoUnico}` };
    return apiFetch("/inscricoes", options);
  },
  
  listarPorParticipante: (participanteId: number): Promise<any[]> => {
    return apiFetch(`/inscricoes/participante/${participanteId}`);
  },

  cancelar: (eventoId: number, participanteId: number): Promise<void> => {
    return apiFetch(`/inscricoes/evento/${eventoId}/participante/${participanteId}`, { method: "DELETE" });
  },

  checkIn: (eventoId: number, cpf: string): Promise<any> => {
    return apiFetch(`/inscricoes/checkin/${eventoId}/cpf/${cpf}`, { method: "PATCH" });
  },

  checkOut: (eventoId: number, cpf: string, token: string): Promise<any> => {
    return apiFetch(`/inscricoes/checkout/${eventoId}/cpf/${cpf}?token=${token}`, { method: "PATCH" });
  }
};