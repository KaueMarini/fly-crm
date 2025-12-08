'use client';

import { useState } from 'react';
import { 
  Phone, MessageCircle, CheckCircle2, XCircle, Clock, 
  MapPin, Wallet, User, MoreHorizontal, Copy, Loader2, Sparkles 
} from 'lucide-react';

export function FocusSession({ leads }: { leads: any[] }) {
  // Filtra leads: Remove quem já foi processado nesta sessão local
  // (O Notion já filtrou os descartados antigos via API, aqui filtramos o estado local)
  const [sessionLeads, setSessionLeads] = useState(leads.slice(0, 15)); // Pega lote de 15 para foco
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const currentLead = sessionLeads[currentIndex];
  const progress = sessionLeads.length > 0 ? ((currentIndex) / sessionLeads.length) * 100 : 0;

  // Função para processar a ação no servidor
  const processAction = async (actionType: 'contact' | 'postpone' | 'discard', label: string) => {
    if (!currentLead) return;
    setLoadingAction(true);
    
    try {
      // Chama a API para salvar no Notion (atualiza status e cria log)
      await fetch('/api/focus/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: currentLead.id, 
          leadName: currentLead.nome,
          action: actionType 
        })
      });

      // Log visual na tela final
      setActionLog([...actionLog, `${label} com ${currentLead.nome}`]);

      // Avança para o próximo
      if (currentIndex < sessionLeads.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
      }

    } catch (error) {
      alert("Erro ao salvar ação. Verifique sua conexão.");
    } finally {
      setLoadingAction(false);
    }
  };

  const getScript = (lead: any) => {
    if (!lead) return "";
    const firstName = lead.nome.split(' ')[0];
    if (lead.perfil === 'Investidor') {
      return `Olá ${firstName}, tudo bem? Vi que você tem perfil investidor. Saiu uma oportunidade em ${lead.cidades[0] || 'nossa região'} com alta projeção de valorização. Tem 5 minutos para eu te apresentar?`;
    }
    return `Oi ${firstName}! Estou organizando as visitas da semana em ${lead.cidades[0] || 'imóveis do seu perfil'} e lembrei de você. Consegue falar agora rapidinho?`;
  };

  const handleWhatsApp = () => {
    if (!currentLead) return;
    const rawPhone = currentLead.telefone.replace(/\D/g, '');
    const phone = rawPhone.length < 10 || rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const text = getScript(currentLead);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    
    // Marca como contactado automaticamente ao abrir o Whats
    processAction('contact', 'Mensagem enviada');
  };

  const copyScript = () => {
    if (!currentLead) return;
    navigator.clipboard.writeText(getScript(currentLead));
    alert('Script copiado para a área de transferência!');
  };

  // --- TELA DE CONCLUSÃO ---
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Sessão Finalizada! 🔥</h2>
        <p className="text-slate-400 mb-8">Você zerou suas pendências de hoje.</p>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md text-left mb-8 max-h-60 overflow-y-auto custom-scrollbar">
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-4">Resumo da Sessão</h4>
          <ul className="space-y-3">
            {actionLog.map((log, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-500" /> {log}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20">
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  // --- TELA VAZIA (Sem leads) ---
  if (!currentLead) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
      <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
        <CheckCircle2 size={40} className="text-slate-700" />
      </div>
      <p>Nenhum lead pendente para focar agora! 🏖️</p>
      <button onClick={() => window.location.href = '/'} className="text-blue-500 hover:text-blue-400 text-sm">Voltar ao início</button>
    </div>
  );

  // --- TELA PRINCIPAL (Modo Foco) ---
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col relative">
      
      {/* Loading Overlay (enquanto salva) */}
      {loadingAction && (
        <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center rounded-3xl animate-in fade-in">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl flex items-center gap-3">
            <Loader2 size={24} className="text-blue-500 animate-spin" />
            <span className="text-white font-medium">Processando...</span>
          </div>
        </div>
      )}

      {/* Barra de Progresso */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Modo Foco <span className="text-xs bg-blue-600/10 text-blue-400 border border-blue-600/20 px-2 py-0.5 rounded uppercase tracking-wider">Beta</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Lead {currentIndex + 1} de {sessionLeads.length}</p>
        </div>
        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        
        {/* COLUNA 1: PERFIL DO LEAD (4 colunas) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div>
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-5 border border-slate-700 shadow-inner">
              {currentLead.nome.charAt(0)}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-1 truncate" title={currentLead.nome}>{currentLead.nome}</h1>
            <p className="text-slate-400 text-sm flex items-center gap-2 mb-8">
              <MapPin size={14} className="text-slate-500" /> {currentLead.cidades[0]}
            </p>

            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5 tracking-wider">Perfil Identificado</span>
                <div className="flex items-center gap-2 text-white font-medium">
                  {currentLead.perfil === 'Investidor' ? <Wallet size={18} className="text-emerald-400" /> : <User size={18} className="text-blue-400" />}
                  {currentLead.perfil}
                </div>
              </div>
              
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5 tracking-wider">Score & Status</span>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{currentLead.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${currentLead.leadScore > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{width: `${currentLead.leadScore}%`}}></div>
                    </div>
                    <span className="text-xs font-bold text-white">{currentLead.leadScore}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
              <MoreHorizontal size={16} /> Ver ficha completa
            </button>
          </div>
        </div>

        {/* COLUNA 2: AÇÕES E SCRIPT (8 colunas) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Card de Inteligência / Script */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 flex-1 shadow-lg relative flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-white font-bold">Sugestão de Abordagem</h3>
              </div>
              <button onClick={copyScript} className="text-slate-500 hover:text-white transition-colors" title="Copiar texto">
                <Copy size={18} />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-8 flex-1 relative group">
              <p className="text-slate-300 text-lg leading-relaxed font-light">
                "{getScript(currentLead)}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleWhatsApp}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-900/20 hover:-translate-y-1 active:translate-y-0"
              >
                <MessageCircle size={24} /> Chamar no Whats
              </button>
              <button 
                onClick={() => processAction('contact', 'Ligação realizada')}
                className="py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20 hover:-translate-y-1 active:translate-y-0"
              >
                <Phone size={24} /> Marcar como Feito
              </button>
            </div>
          </div>

          {/* Botões Secundários */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => processAction('postpone', 'Adiado')}
              className="py-3 bg-slate-900 border border-slate-800 hover:border-yellow-500/30 text-slate-400 hover:text-yellow-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
            >
              <Clock size={18} className="group-hover:rotate-12 transition-transform" /> 
              Adiar (Ver depois)
            </button>
            <button 
              onClick={() => processAction('discard', 'Descartado')}
              className="py-3 bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
            >
              <XCircle size={18} className="group-hover:scale-110 transition-transform" /> 
              Não tenho interesse
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}