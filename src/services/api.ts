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
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("muttley_token");
      localStorage.removeItem("muttley_user");
      
      if (!window.location.pathname.includes("/login")) {
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

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/pdf")) {
      return response.blob();
  }

  return response.json();
}