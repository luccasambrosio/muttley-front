export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  aprovado: boolean;
}

export interface UsuarioCadastroData {
  nome: string;
  email: string;
  senha: string;
  perfil: string; // "ADMIN" ou "GESTOR"
}

export interface UsuarioLoginData {
  email: string;
  senha: string;
}