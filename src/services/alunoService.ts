import { Aluno, AlunoFormData } from "@/types/aluno";
import { apiFetch } from "./api";

export const alunoService = {
  
  listarTodos: (): Promise<Aluno[]> => {
    return apiFetch("/alunos");
  },

  buscarPorId: (id: number): Promise<Aluno> => {
    return apiFetch(`/alunos/${id}`);
  },

  criar: (dados: AlunoFormData): Promise<Aluno> => {
    return apiFetch("/alunos", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizar: (id: number, dados: AlunoFormData): Promise<Aluno> => {
    return apiFetch(`/alunos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluir: (id: number): Promise<void> => {
    return apiFetch(`/alunos/${id}`, {
      method: "DELETE",
    });
  }
};