"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usuarioService } from "@/services/usuarioService";
import { participanteService } from "@/services/participanteService";
import { User, Shield } from "lucide-react";
import SignaturePad from "@/components/SignaturePad";

export default function LoginPage() {
  const router = useRouter();
  
  const [modo, setModo] = useState<"PARTICIPANTE" | "GESTOR" | "CADASTRO" | "CADASTRO_PARTICIPANTE">("PARTICIPANTE");
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  
  const [assinaturaBase64, setAssinaturaBase64] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("abrir_cadastro_participante")) {
      setModo("CADASTRO_PARTICIPANTE");
      sessionStorage.removeItem("abrir_cadastro_participante");
    }
  }, []);

  const salvarSessao = (dados: any) => {
    localStorage.setItem("muttley_token", dados.token);
    localStorage.setItem("muttley_user", JSON.stringify({ nome: dados.nome, role: dados.role }));
    window.dispatchEvent(new Event("muttley-auth"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      if (modo === "PARTICIPANTE") {
        const res = await usuarioService.loginParticipante({ cpf, dataNascimento });
        salvarSessao(res);
        
        const urlPendente = sessionStorage.getItem("redirect_after_login");
        if (urlPendente) {
          sessionStorage.removeItem("redirect_after_login");
          router.push(urlPendente);
        } else {
          router.push("/eventos"); 
        }
      }
      else if (modo === "CADASTRO_PARTICIPANTE") {
        await participanteService.criar({ nome, email, cpf, dataNascimento });
        setMensagem({ texto: "Cadastro realizado com sucesso! Faça o login abaixo.", tipo: "sucesso" });
        setModo("PARTICIPANTE");
      }
      else if (modo === "GESTOR") {
        const res = await usuarioService.loginGerencial({ email, senha });
        salvarSessao(res);
        router.push("/eventos"); 
      }
      else if (modo === "CADASTRO") {
        if (!assinaturaBase64) {
          setMensagem({ texto: "Desenhe sua assinatura para concluir o cadastro.", tipo: "erro" });
          setIsLoading(false);
          return;
        }
        await usuarioService.cadastrarGestor({ nome, email, senha, assinaturaBase64 });
        setAssinaturaBase64(null);
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
    <div className="page-shell flex items-center justify-center p-4">
      <div className="card-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="bg-blue-600 p-8 text-center">
          <h1 className="text-3xl font-black text-white">Muttley</h1>
          <p className="text-blue-100 mt-1">Plataforma de Eventos</p>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button type="button" onClick={() => { setModo("PARTICIPANTE"); setMensagem({texto:"", tipo:""}); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "PARTICIPANTE" || modo === "CADASTRO_PARTICIPANTE" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
            <User className="w-4 h-4" /> Participante
          </button>
          <button type="button" onClick={() => { setModo("GESTOR"); setMensagem({texto:"", tipo:""}); }}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "GESTOR" || modo === "CADASTRO" ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
            <Shield className="w-4 h-4" /> Gestor
          </button>
        </div>

        <div className="p-8">
          {mensagem.texto && (
            <div className={`p-3 rounded mb-5 text-sm font-bold border ${mensagem.tipo === "erro" ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900" : "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900"}`}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {(modo === "PARTICIPANTE" || modo === "CADASTRO_PARTICIPANTE") && (
              <>
                {modo === "CADASTRO_PARTICIPANTE" && (
                  <>
                    <div>
                      <label className="field-label">Nome Completo</label>
                      <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="field-input p-3 rounded-lg" />
                    </div>
                    <div>
                      <label className="field-label">E-mail</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input p-3 rounded-lg" />
                    </div>
                  </>
                )}
                <div>
                  <label className="field-label">CPF</label>
                  <input type="text" required value={cpf} onChange={(e) => setCpf(e.target.value)} className="field-input p-3 rounded-lg" placeholder="111.111.111-11" />
                </div>
                <div>
                  <label className="field-label">Data de Nascimento</label>
                  <input type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="field-input p-3 rounded-lg" />
                </div>
              </>
            )}

            {(modo === "GESTOR" || modo === "CADASTRO") && (
              <>
                {modo === "CADASTRO" && (
                  <div>
                    <label className="field-label">Nome Completo</label>
                    <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="field-input p-3 rounded-lg" />
                  </div>
                )}
                <div>
                  <label className="field-label">E-mail</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input p-3 rounded-lg" />
                </div>
                <div>
                  <label className="field-label">Senha</label>
                  <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} className="field-input p-3 rounded-lg" />
                </div>
                {modo === "CADASTRO" && (
                  <SignaturePad onChange={setAssinaturaBase64} />
                )}
              </>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition">
              {isLoading ? "Aguarde..." : (modo === "CADASTRO" || modo === "CADASTRO_PARTICIPANTE") ? "Finalizar Cadastro" : "Entrar no Sistema"}
            </button>
          </form>

          <div className="mt-6 text-center">
            {modo === "PARTICIPANTE" || modo === "CADASTRO_PARTICIPANTE" ? (
              <button type="button" onClick={() => setModo(modo === "PARTICIPANTE" ? "CADASTRO_PARTICIPANTE" : "PARTICIPANTE")} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                {modo === "PARTICIPANTE" ? "Novo participante? Cadastre-se aqui" : "Já tenho conta. Fazer login"}
              </button>
            ) : (
              <button type="button" onClick={() => setModo(modo === "GESTOR" ? "CADASTRO" : "GESTOR")} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                {modo === "GESTOR" ? "Novo professor? Solicite acesso" : "Já tenho conta. Fazer Login"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}