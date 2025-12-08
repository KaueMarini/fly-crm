'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, X, Sparkles, Command, CheckCircle2, Loader2, Bot, User, BarChart3, AlertCircle } from 'lucide-react';

// URL do seu Webhook N8N
const N8N_WEBHOOK_VOICE = 'https://webhook.saveautomatik.shop/webhook/ComandoVoz'; 

export function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'pt-BR';
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (transcript.trim().length > 2) {
            processQuestion(transcript);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [transcript]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Navegador não suportado. Por favor, use Chrome ou Edge.");
      return;
    }
    setAiResponse(null);
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  // --- CORREÇÃO AQUI ---
  const processQuestion = async (text: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(N8N_WEBHOOK_VOICE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: text,
          userTime: new Date().toISOString()
        })
      });

      let responseText = "";

      // Verifica o tipo de conteúdo que o n8n retornou
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        // Se for JSON, tenta extrair a mensagem
        const data = await response.json();
        responseText = data.message || data.output || data.text || JSON.stringify(data);
      } else {
        // Se for Texto Puro (como "Você não atendeu ninguém"), pega direto
        responseText = await response.text();
      }

      if (response.ok) {
        // Remove aspas extras se o n8n retornar string com aspas
        setAiResponse(responseText.replace(/^"|"$/g, '')); 
      } else {
        setAiResponse(`Erro do Servidor (${response.status}): ${responseText}`);
      }

    } catch (error) {
      console.error("Erro ao processar:", error);
      setAiResponse("Não consegui conectar ao seu assistente. Verifique se o n8n está ativo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all duration-500 group ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        } bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-white/10`}
      >
        <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping group-hover:animate-none"></div>
        <Sparkles size={24} />
      </button>

      {/* Interface da IA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
            
            {/* Cabeçalho */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Bot size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">FlyAssistant AI</h3>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Analista de Dados</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Pergunta do Usuário */}
              {transcript && !isListening && (
                <div className="flex justify-end animate-in slide-in-from-right-5">
                  <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] border border-slate-700">
                    <p className="text-sm">"{transcript}"</p>
                  </div>
                  <div className="ml-3 mt-auto p-2 bg-slate-800 rounded-full h-fit">
                    <User size={14} className="text-slate-400" />
                  </div>
                </div>
              )}

              {/* Estado: Processando */}
              {isProcessing && (
                <div className="flex items-center gap-3 text-slate-500 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                  </div>
                  <span className="text-xs font-medium">Analisando base de dados...</span>
                </div>
              )}

              {/* Resposta da IA */}
              {aiResponse && !isProcessing && (
                <div className="flex justify-start animate-in slide-in-from-left-5 duration-500">
                  <div className="mr-3 mt-auto p-2 bg-indigo-600/20 rounded-full h-fit border border-indigo-500/30">
                    <Sparkles size={16} className="text-indigo-400" />
                  </div>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-5 py-4 rounded-2xl rounded-tl-sm max-w-[90%] border border-slate-700 shadow-xl">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                </div>
              )}

              {/* Estado Inicial */}
              {!transcript && !isListening && !aiResponse && !isProcessing && (
                <div className="text-center py-10 text-slate-500">
                  <p className="text-sm mb-2">Tente perguntar:</p>
                  <p className="text-white font-medium italic">"Quantos leads falei hoje?"</p>
                  <p className="text-white font-medium italic mt-1">"Qual o valor total do pipeline de investidores?"</p>
                </div>
              )}
            </div>

            {/* Rodapé / Controles */}
            <div className="p-6 pt-0 bg-gradient-to-t from-slate-900 to-transparent">
              <div className="flex justify-center">
                {isListening ? (
                  <div className="relative cursor-pointer" onClick={stopListening}>
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                        <div className="w-4 h-4 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-red-400 font-bold whitespace-nowrap">Ouvindo...</p>
                  </div>
                ) : (
                  <button 
                    onClick={startListening}
                    className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <Mic size={20} className="group-hover:animate-bounce" /> 
                    {aiResponse ? "Fazer outra pergunta" : "Toque para Falar"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}