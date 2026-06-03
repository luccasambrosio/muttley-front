"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { inscricaoService } from "@/services/inscricaoService";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

// No Next 15, params é uma Promise
interface PageProps { params: Promise<{ eventoId: string }> }

export default function ParticipanteCheckoutPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Desempacota a Promise corretamente
  const resolvedParams = use(params);
  const eventoId = resolvedParams.eventoId; 
  
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"PROCESSANDO" | "SUCESSO" | "ERRO">("PROCESSANDO");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function processarCheckout() {
      if (!token) {
        setStatus("ERRO");
        setMensagem("QR Code inválido. Token ausente.");
        return;
      }

      const muttleyToken = localStorage.getItem("muttley_token");
      const userStr = localStorage.getItem("muttley_user");

      if (!muttleyToken || !userStr || JSON.parse(userStr).role !== "PARTICIPANTE") {
        sessionStorage.setItem("redirect_after_login", window.location.pathname + window.location.search);
        router.push("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(muttleyToken.split('.')[1]));
        const cpf = payload.sub; 

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
    <div className="page-shell">
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="card-surface rounded-2xl p-8 shadow-xl flex flex-col items-center">
          
          {status === "PROCESSANDO" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Validando Saída...</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Aguarde enquanto registramos seu check-out.</p>
            </>
          )}

          {status === "SUCESSO" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Sucesso!</h1>
              <p className="text-green-700 font-medium mt-2">{mensagem}</p>
              <button onClick={() => router.push("/eventos")} className="mt-8 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700">
                Voltar aos Eventos
              </button>
            </>
          )}

          {status === "ERRO" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Atenção</h1>
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
