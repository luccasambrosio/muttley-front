import { Apresentador } from "./apresentador"; // Assumindo que você tem esse tipo

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  complexidade: number;
  requerCheckout: boolean;
  tokenCheckoutEstatico?: string;
  tokenCheckoutDinamico?: string;
  apresentadores: Apresentador[];
}

export interface EventoFormData extends Omit<Evento, "id" | "tokenCheckoutEstatico" | "tokenCheckoutDinamico" | "apresentadores"> {
  apresentadoresIds: number[];
}