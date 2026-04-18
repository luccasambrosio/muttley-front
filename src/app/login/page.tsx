"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usuarioService } from "@/services/usuarioService";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  
  // Controle de qual formulário está aparecendo
  const [isLogin, setIsLogin] = useState(true);
  
  // Estados dos campos
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  // Estado para mensagens de erro ou sucesso
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      if (isLogin) {
        // Fluxo de Login
        const usuario = await usuarioService.login({ email, senha });
        
        // Como ainda não temos sessão/cookies configurados, 
        // vamos apenas jogar um alert e ir para a home provisoriamente
        alert(`Bem-vindo, ${usuario.nome}!`);
        router.push("/"); 

      } else {
        // Fluxo de Cadastro (Sempre mandando como GESTOR)
        await usuarioService.cadastrar({ 
          nome, 
          email, 
          senha, 
          perfil: "GESTOR" 
        });
        
        setMensagem({ 
          texto: "Cadastro realizado! Aguarde a aprovação do Admin.", 
          tipo: "sucesso" 
        });
        
        // Limpa os campos e volta para a tela de login
        setIsLogin(true);
        setSenha("");
      }
    } catch (error: any) {
      setMensagem({ 
        texto: error.message || "Erro ao processar a requisição.", 
        tipo: "erro" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" isLink={false} />
          <p className="text-gray-500 mt-2">
            {isLogin ? "Faça login para acessar o sistema" : "Crie sua conta de Gestor"}
          </p>
        </div>

        {mensagem.texto && (
          <div className={`p-3 rounded mb-4 text-sm font-medium ${
            mensagem.tipo === "erro" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nome (Aparece só no cadastro) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required={!isLogin}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ex: João Silva"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? "Aguarde..." : (isLogin ? "Entrar no Sistema" : "Solicitar Acesso")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMensagem({ texto: "", tipo: "" }); // Limpa as mensagens ao trocar
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isLogin 
              ? "Não tem uma conta? Cadastre-se" 
              : "Já tem uma conta? Faça login"}
          </button>
        </div>

      </div>
    </div>
  );
}