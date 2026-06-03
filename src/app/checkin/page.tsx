"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { eventoService } from "@/services/eventoService";
import { inscricaoService } from "@/services/inscricaoService";
import { Scan, CheckCircle, XCircle } from "lucide-react";

export default function CheckInPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<number | "">("");
  const [cpfManual, setCpfManual] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    eventoService.listarTodos().then(setEventos).catch(console.error);
  }, []);

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
      
      // Limpa a mensagem de sucesso após alguns segundos
      setTimeout(() => {
        setMensagem({ texto: "", tipo: "" });
      }, 2500);

    } catch (error: any) {
      setMensagem({ texto: error.data || "Erro ao fazer check-in.", tipo: "erro" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <main className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="card-surface rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
              <Scan className="w-6 h-6" /> Controle de Portaria (Check-in)
            </h1>
          </div>

          <div className="p-6">
            
            {mensagem.texto && (
              <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${mensagem.tipo === "erro" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                {mensagem.tipo === "erro" ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                <span className="font-bold text-sm">{mensagem.texto}</span>
              </div>
            )}

            <form onSubmit={processarCheckIn} className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="field-label">Evento / Palestra:</label>
                <select 
                  className="field-input rounded-lg p-3 font-medium"
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
                <label className="field-label">CPF do Participante</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: 111.111.111-11" 
                  value={cpfManual} 
                  onChange={(e) => setCpfManual(e.target.value)} 
                  className="field-input rounded-lg p-3 w-full" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 transition"
              >
                {isLoading ? "Validando..." : "Confirmar Check-in"}
              </button>
            </form>

          </div>
        </div>

      </main>
    </div>
  );
}