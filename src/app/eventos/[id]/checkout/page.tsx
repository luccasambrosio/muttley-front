"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { eventoService } from "@/services/eventoService";
import { ArrowLeft, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

// No Next 15, params é uma Promise
interface PageProps { params: Promise<{ id: string }> }

export default function CheckoutQRCodePage({ params }: PageProps) {
  const router = useRouter();
  
  // Desempacota a Promise corretamente usando o 'use' do React
  const resolvedParams = use(params);
  const id = resolvedParams.id; 

  const [evento, setEvento] = useState<any>(null);
  const [tokenAtual, setTokenAtual] = useState<string>("");
  const [useEstatico, setUseEstatico] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [contagem, setContagem] = useState<number>(10);

  useEffect(() => {
    async function iniciarDados() {
      try {
        const dados = await eventoService.buscarPorId(id);
        setEvento(dados);
        
        if (dados.tokenCheckoutDinamico) {
          setTokenAtual(dados.tokenCheckoutDinamico);
        } else if (dados.tokenCheckoutEstatico) {
          setUseEstatico(true);
          setTokenAtual(dados.tokenCheckoutEstatico);
        } else {
          const res = await eventoService.girarTokenDinamico(id);
          setTokenAtual(res.token);
          setUseEstatico(false);
        }
      } catch (e) {
        alert("Erro ao buscar dados do check-out.");
        router.push("/eventos");
      } finally {
        setLoading(false);
      }
    }
    iniciarDados();
  }, [id, router]);

  useEffect(() => {
    if (useEstatico || !evento) return;
    const interval = setInterval(async () => {
      setContagem((prev) => {
        if (prev <= 1) {
          eventoService.girarTokenDinamico(id).then(res => setTokenAtual(res.token)).catch(console.error);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [useEstatico, evento, id]);

  const alternarModo = () => {
    if (!useEstatico) {
      setUseEstatico(true);
      setTokenAtual(evento?.tokenCheckoutEstatico || "SEM_TOKEN");
    } else {
      setUseEstatico(false);
      setContagem(10);
      setTokenAtual(evento?.tokenCheckoutDinamico || "SEM_TOKEN");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50"><Header /><div className="text-center py-20">Montando painel de QR Code...</div></div>;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const linkCheckout = `${baseUrl}/checkout-aluno/${id}?token=${tokenAtual}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(linkCheckout)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 py-12">
        <button onClick={() => router.push("/eventos")} className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-900 mb-6 bg-white px-3 py-1.5 rounded-lg border shadow-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Eventos
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-center">
          <div className="bg-blue-600 p-6 text-white">
            <h2 className="text-xl font-black truncate">{evento?.titulo}</h2>
            <p className="text-blue-100 text-xs mt-1 uppercase tracking-wider font-bold">Aponte a câmera para registrar a saída</p>
          </div>

          <div className="p-8 flex flex-col items-center justify-center">
            <button onClick={alternarModo} className="flex items-center gap-2 mb-6 text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-full border hover:bg-gray-100">
              {useEstatico ? (
                <><ToggleLeft className="w-6 h-6 text-gray-400" /><span>Exibindo: <strong className="text-orange-600">Permanente</strong></span></>
              ) : (
                <><ToggleRight className="w-6 h-6 text-green-600" /><span>Exibindo: <strong className="text-green-600">Dinâmico</strong></span></>
              )}
            </button>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-inner mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeUrl} alt="Check-out QR Code" className="w-64 h-64 mx-auto object-contain select-none" />
            </div>

            {!useEstatico && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Muda em {contagem}s</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}