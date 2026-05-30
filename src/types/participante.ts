export interface Participante {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
}

export interface ParticipanteFormData {
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
}