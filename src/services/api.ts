const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("muttley_token") : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // ---> NOVA LÓGICA DE DESLOGAR SILENCIOSAMENTE <---
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("muttley_token");
      localStorage.removeItem("muttley_user");
      
      // Avisa os componentes (Header, Page) que o usuário caiu e deve virar Visitante
      window.dispatchEvent(new Event("muttley-auth"));
      
      // Só redireciona à força se ele estiver numa rota estritamente privada
      const publicRoutes = ["/eventos", "/login", "/"];
      const currentPath = window.location.pathname;
      const isPublic = publicRoutes.includes(currentPath) || currentPath.startsWith("/checkout-participante");
      
      if (!isPublic) {
        window.location.href = "/login";
      }
    }

    let mensagemErro = "Erro inesperado na requisição.";
    try {
      const errorData = await response.json();
      mensagemErro = errorData.mensagem || errorData.message || errorData.error || (typeof errorData === "string" ? errorData : JSON.stringify(errorData)); 
    } catch {}
    
    throw { status: response.status, data: mensagemErro };
  }

  if (response.status === 204) return null;

  // ---> A ORDEM CERTA É ESSA AQUI <---
  // 1. Verifica se o servidor mandou um PDF PRIMEIRO
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/pdf")) {
      return await response.blob(); // Se for PDF, extrai como arquivo (Blob) e encerra aqui.
  }

  // 2. Se não for PDF, aí sim nós lemos como texto/JSON
  const text = await response.text();
  if (!text) return null; 

  return JSON.parse(text);
}