import { apiFetch } from "./api";

export const usuarioService = {
  loginGerencial: (dados: any): Promise<any> => {
    return apiFetch("/auth/login/gerencial", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  loginParticipante: (dados: any): Promise<any> => {
    return apiFetch("/auth/login/participante", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  cadastrarGestor: (dados: any): Promise<any> => {
    return apiFetch("/auth/cadastro/gestor", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  }
};