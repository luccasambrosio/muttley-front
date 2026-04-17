// src/services/api.ts

// Puxa a variável do .env. Se ela não existir (em produção, por exemplo), usa o localhost como fallback de segurança.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";

// Esta função vai "envelopar" o fetch original do navegador
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json", // Já garante que tudo que vai e volta é JSON
      ...options?.headers,
    },
  });

  // Intercepta erros globalmente (ex: se o Spring Boot devolver Status 400 ou 500)
  if (!response.ok) {
    let mensagemErro = "Erro inesperado na requisição.";
    try {
        // Tenta ler o JSON de erro do Spring Boot (aquele nosso TratadorDeErros)
        const errorData = await response.json();
        mensagemErro = errorData; 
    } catch {
        // Se a API cair de vez e não devolver JSON, ignora e usa a genérica
    }
    throw { status: response.status, data: mensagemErro };
  }

  // Se for um DELETE (204 No Content), não tenta fazer o parse do JSON para não dar erro
  if (response.status === 204) {
    return null;
  }

  return response.json();
}