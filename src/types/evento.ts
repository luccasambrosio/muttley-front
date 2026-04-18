export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string; // Vem do Java como "YYYY-MM-DD"
  horaInicio: string; // Vem do Java como "HH:mm:ss"
  dataFim: string;
  horaFim: string;
}

// Para criar/editar, não enviamos o ID
export type EventoFormData = Omit<Evento, "id">;