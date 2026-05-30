"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usuarioService } from "@/services/usuarioService";
import { participanteService } from "@/services/participanteService";
import { User, Shield, UserPlus } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  const [modo, setModo] = useState<"ALUNO" | "GESTOR" | "CADASTRO" | "CADASTRO_ALUNO">("ALUNO");
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("abrir_cadastro_aluno")) {
      setModo("CADASTRO_ALUNO");
      sessionStorage.removeItem("abrir_cadastro_aluno");
    }
  }, []);

  const salvarSessao = (dados: any) => {
    localStorage.setItem("muttley_token", dados.token);
    localStorage.setItem("muttley_user", JSON.stringify({ nome: dados.nome, role: dados.role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      if (modo === "ALUNO") {
        const res = await usuarioService.loginAluno({ cpf, dataNascimento });
        salvarSessao(res);
        router.push("/eventos"); 
      } 
      else if (modo === "CADASTRO_ALUNO") {
        // Agora usamos o service oficial que você já tinha criado!
        await participanteService.criar({ nome, email, cpf, dataNascimento });
        setMensagem({ texto: "Cadastro realizado com sucesso! Agora você pode fazer o login abaixo.", tipo: "sucesso" });
        setModo("ALUNO");
      }
      else if (modo === "GESTOR") {
        const res = await usuarioService.loginGerencial({ email, senha });
        salvarSessao(res);
        router.push("/eventos"); 
      } 
      else if (modo === "CADASTRO") {
        await usuarioService.cadastrarGestor({ nome, email, senha });
        setMensagem({ texto: "Cadastro realizado! Aguarde aprovação.", tipo: "sucesso" });
        setModo("GESTOR");
      }
    } catch (error: any) {
      setMensagem({ texto: error.data || "Erro ao conectar.", tipo: "erro" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border">
        
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-black text-white">Muttley</h1>
          <p className="text-blue-100 mt-1">Plataforma de Eventos</p>
        </div>

        <div className="flex border-b bg-gray-50">
          <button type="button" onClick={() => { setModo("ALUNO"); setMensagem({texto:"", tipo:""}); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "ALUNO" || modo === "CADASTRO_ALUNO" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}>
            <User className="w-4 h-4" /> Aluno
          </button>
          <button type="button" onClick={() => { setModo("GESTOR"); setMensagem({texto:"", tipo:""}); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "GESTOR" || modo === "CADASTRO" ? "text-blue-600 border-b-2 border-blue-600 bg-white" : "text-gray-500 hover:text-gray-700"}`}>
            <Shield className="w-4 h-4" /> Gestor
          </button>
        </div>

        <div className="p-8">
          {mensagem.texto && (
            <div className={`p-3 rounded mb-5 text-sm font-bold ${mensagem.tipo === "erro" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {(modo === "ALUNO" || modo === "CADASTRO_ALUNO") && (
              <>
                {modo === "CADASTRO_ALUNO" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                      <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">CPF</label>
                  <input type="text" required value={cpf} onChange={(e) => setCpf(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="111.111.111-11" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data de Nascimento</label>
                  <input type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            {(modo === "GESTOR" || modo === "CADASTRO") && (
              <>
                {modo === "CADASTRO" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                    <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                  <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full p-3 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition">
              {isLoading ? "Aguarde..." : (modo === "CADASTRO" || modo === "CADASTRO_ALUNO") ? "Finalizar Cadastro" : "Entrar no Sistema"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {modo === "ALUNO" || modo === "CADASTRO_ALUNO" ? (
              <button type="button" onClick={() => setModo(modo === "ALUNO" ? "CADASTRO_ALUNO" : "ALUNO")} className="text-sm font-bold text-blue-600 hover:underline">
                {modo === "ALUNO" ? "Novo aluno? Cadastre-se aqui" : "Já tenho conta. Fazer login"}
              </button>
            ) : (
              <button type="button" onClick={() => setModo(modo === "GESTOR" ? "CADASTRO" : "GESTOR")} className="text-sm font-bold text-blue-600 hover:underline">
                {modo === "GESTOR" ? "Novo professor? Solicite acesso" : "Já tenho conta. Fazer Login"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}