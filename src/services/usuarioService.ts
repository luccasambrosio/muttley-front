import { apiFetch } from "./api";
import { Usuario, UsuarioCadastroData, UsuarioLoginData } from "@/types/usuario";

export const usuarioService = {
  login: (dados: UsuarioLoginData): Promise<Usuario> => {
    return apiFetch("/usuarios/login", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  cadastrar: (dados: UsuarioCadastroData): Promise<Usuario> => {
    return apiFetch("/usuarios/cadastro", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  }
};