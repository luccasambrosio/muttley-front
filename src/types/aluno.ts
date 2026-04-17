export interface Aluno {
  id: number;
  nome: string;
  curso: string;
  email: string;
}

export interface AlunoFormData {
  nome: string;
  curso: string;
  email: string;
}