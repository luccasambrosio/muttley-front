"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { inscricaoService } from "@/services/inscricaoService";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PageProps { params: Promise<{ eventoId: string }> }

export default function AlunoCheckoutPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { eventoId } = use(params);
  
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"PROCESSANDO" | "SUCESSO" | "ERRO">("PROCESSANDO");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function processarCheckout() {
      // Verifica se há token na URL
      if (!token) {
        setStatus("ERRO");
        setMensagem("QR Code inválido. Token ausente.");
        return;
      }

      // Verifica se o aluno está logado
      const muttleyToken = localStorage.getItem("muttley_token");
      const userStr = localStorage.getItem("muttley_user");

      if (!muttleyToken || !userStr || JSON.parse(userStr).role !== "ALUNO") {
        // Se deslogado, guarda a URL atual para ele voltar depois do login
        sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
        router.push("/login");
        return;
      }

      // Se logado, extrai o CPF de dentro do JWT (O 'sub' no Spring Boot é o CPF do Aluno)
      try {
        const payload = JSON.parse(atob(muttleyToken.split('.')[1]));
        const cpf = payload.sub; 

        // Dispara o Check-out no Java
        await inscricaoService.checkOut(Number(eventoId), cpf, token);
        
        setStatus("SUCESSO");
        setMensagem("Check-out realizado e Certificado enviado para o seu e-mail!");
      } catch (error: any) {
        setStatus("ERRO");
        setMensagem(error.data || "Erro ao registrar check-out. Tente novamente.");
      }
    }

    processarCheckout();
  }, [eventoId, token, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col items-center">
          
          {status === "PROCESSANDO" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <h1 className="text-xl font-bold">Validando Saída...</h1>
              <p className="text-gray-500 text-sm mt-2">Aguarde enquanto registramos seu check-out.</p>
            </>
          )}

          {status === "SUCESSO" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-black text-gray-900">Sucesso!</h1>
              <p className="text-green-700 font-medium mt-2">{mensagem}</p>
              <button onClick={() => router.push("/eventos")} className="mt-8 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200">
                Voltar aos Eventos
              </button>
            </>
          )}

          {status === "ERRO" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-black text-gray-900">Atenção</h1>
              <p className="text-red-600 font-medium mt-2">{mensagem}</p>
              <button onClick={() => router.push("/eventos")} className="mt-8 bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700">
                Tentar Novamente
              </button>
            </>
          )}

        </div>
      </main>
    </div>
  );
}