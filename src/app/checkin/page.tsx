"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import { eventoService } from "@/services/eventoService";
import { inscricaoService } from "@/services/inscricaoService";
import { Scan, Keyboard, CheckCircle, XCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function CheckInPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | "">("");
  
  const [modo, setModo] = useState<"CAMERA" | "MANUAL">("CAMERA");
  const [cpfManual, setCpfManual] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  // A REFERÊNCIA PARA MATAR A CÂMERA DEPOIS
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    eventoService.listarTodos().then(setEventos).catch(console.error);
  }, []);

  // ---> CORREÇÃO DA LUZ DA CÂMERA <---
  useEffect(() => {
    if (modo !== "CAMERA") return;

    // Instancia o leitor
    scannerRef.current = new Html5Qrcode("reader");

    scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.cpf && data.eventoId) {
            setEventoSelecionado(Number(data.eventoId)); 
            setCpfManual(data.cpf);                      
            setMensagem({ texto: "Ingresso lido com sucesso! Confirme para fazer o Check-in.", tipo: "sucesso" });
            setModo("MANUAL"); 
          } else {
            setCpfManual(decodedText);
            setMensagem({ texto: "QR Code lido. Selecione o evento e confirme.", tipo: "sucesso" });
            setModo("MANUAL");
          }
        } catch (e) {
          setCpfManual(decodedText);
          setMensagem({ texto: "Código lido. Selecione o evento e confirme.", tipo: "sucesso" });
          setModo("MANUAL");
        }
      },
      (errorMessage) => { /* Ignora frames vazios silenciosamente */ }
    ).catch(err => {
      setMensagem({ texto: "Câmera bloqueada ou não encontrada. Digite os dados.", tipo: "erro" });
      setModo("MANUAL");
    });

    // Função de limpeza que roda QUANDO O COMPONENTE MORRE OU MUDA DE ABA
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .then(() => {
            scannerRef.current?.clear(); // Desliga o hardware do vídeo!
          })
          .catch(console.error);
      }
    };
  }, [modo]);

  const processarCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoSelecionado || !cpfManual) {
      setMensagem({ texto: "Selecione um evento e insira o CPF.", tipo: "erro" });
      return;
    }
    
    setIsLoading(true);
    setMensagem({ texto: "", tipo: "" });

    try {
      await inscricaoService.checkIn(Number(eventoSelecionado), cpfManual);
      setMensagem({ texto: `Check-in de ${cpfManual} realizado com sucesso!`, tipo: "sucesso" });
      setCpfManual("");
      
      setTimeout(() => {
        setMensagem({ texto: "", tipo: "" });
        setModo("CAMERA");
      }, 2500);

    } catch (error: any) {
      setMensagem({ texto: error.data || "Erro ao fazer check-in.", tipo: "erro" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
              <Scan className="w-6 h-6" /> Controle de Portaria (Check-in)
            </h1>
          </div>

          <div className="p-6">
            
            <div className="flex border-b mb-6">
              <button onClick={() => setModo("CAMERA")} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "CAMERA" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}>
                <Scan className="w-4 h-4" /> Usar Câmera
              </button>
              <button onClick={() => setModo("MANUAL")} className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${modo === "MANUAL" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}>
                <Keyboard className="w-4 h-4" /> Validar Check-in
              </button>
            </div>

            {mensagem.texto && (
              <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${mensagem.tipo === "erro" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                {mensagem.tipo === "erro" ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                <span className="font-bold text-sm">{mensagem.texto}</span>
              </div>
            )}

            {modo === "CAMERA" && (
              <div className="flex flex-col items-center">
                {/* A div 'reader' precisa sempre estar presente no DOM para a ref encontrá-la */}
                <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden shadow-inner bg-black border-2 border-dashed border-gray-300 min-h-[300px]"></div>
                <p className="text-xs text-gray-500 mt-4 text-center max-w-xs font-bold">
                  Aponte a câmera para o QR Code do aluno. O Evento e o CPF serão selecionados automaticamente!
                </p>
              </div>
            )}

            {modo === "MANUAL" && (
              <form onSubmit={processarCheckIn} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Evento / Palestra:</label>
                  <select 
                    className="w-full p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={eventoSelecionado}
                    onChange={(e) => setEventoSelecionado(Number(e.target.value))}
                  >
                    <option value="" disabled>-- Escolha Manualmente --</option>
                    {eventos.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.titulo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">CPF do Participante</label>
                  <input type="text" required placeholder="Ex: 111.111.111-11" value={cpfManual} onChange={(e) => setCpfManual(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition">
                  {isLoading ? "Validando..." : "Confirmar Check-in"}
                </button>
              </form>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}