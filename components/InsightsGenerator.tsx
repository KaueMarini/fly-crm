'use client';

import { useState } from 'react';
import { Sparkles, Calendar, User, Loader2, BarChart3, Copy, CheckCircle2, FileText, BrainCircuit } from 'lucide-react';

export function InsightsGenerator() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [days, setDays] = useState('7');
  const [profile, setProfile] = useState('Todos');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setInsight('');
    setCopied(false);

    try {
      const response = await fetch('https://webhook.saveautomatik.shop/webhook/insigthsIA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodo_dias: Number(days),
          perfil_alvo: profile,
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.insight || JSON.stringify(data);
        setInsight(text);
      } else {
        setInsight("Erro ao conectar com o servidor de IA. Verifique o Webhook.");
      }
    } catch (error) {
      setInsight("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* --- COLUNA DE CONTROLE (Esquerda) --- */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 pb-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="text-blue-500" size={24} />
              Configurar Análise
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Defina os parâmetros para a IA processar sua base de dados.
            </p>
          </div>

          <div className="space-y-5">
            {/* Seletor de Dias */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={14} /> Período
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-950 border border-slate-700 hover:border-blue-500/50 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                >
                  <option value="3">Últimos 3 dias</option>
                  <option value="7">Últimos 7 dias</option>
                  <option value="15">Últimos 15 dias</option>
                  <option value="30">Últimos 30 dias</option>
                </select>
                {/* Seta customizada */}
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Seletor de Perfil */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Segmentação
              </label>
              <div className="relative">
                <select
                  className="w-full bg-slate-950 border border-slate-700 hover:border-blue-500/50 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                >
                  <option value="Todos">Todos os Perfis</option>
                  <option value="Investidor">Apenas Investidores</option>
                  <option value="Moradia">Apenas Moradia</option>
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-6 border border-white/10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} className="text-yellow-300 group-hover:animate-pulse" />
              )}
              {loading ? 'Processando dados...' : 'Gerar Relatório IA'}
            </button>
          </div>
        </div>

        {/* Dica Pro */}
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 flex gap-3 items-start">
          <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
            <BarChart3 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-emerald-400 font-medium text-sm">Dica Pro</h4>
            <p className="text-emerald-200/60 text-xs mt-1 leading-relaxed">
              Utilize o filtro de 30 dias para identificar tendências de mercado mais sólidas e sazonalidades.
            </p>
          </div>
        </div>
      </div>

      {/* --- COLUNA DE RESULTADO (Direita) --- */}
      <div className="lg:col-span-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl h-full min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl">
          
          {/* Header do Resultado */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${insight ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                <FileText size={20} className={insight ? 'text-blue-400' : 'text-slate-600'} />
              </div>
              <div>
                <h3 className="text-white font-medium">Relatório de Inteligência</h3>
                <p className="text-slate-500 text-xs">Gerado por IA • Imob CRM</p>
              </div>
            </div>

            {insight && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            )}
          </div>

          {/* Área de Conteúdo */}
          <div className="flex-1 p-8 relative">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-blue-400 animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-slate-400 font-medium animate-pulse">Analisando leads...</p>
                <p className="text-slate-600 text-xs mt-2">Isso pode levar alguns segundos</p>
              </div>
            ) : null}

            {insight ? (
              <div className="prose prose-invert max-w-none">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Renderização do Texto com Estilo */}
                  <div className="text-slate-300 leading-8 whitespace-pre-wrap font-light text-[15px]">
                    {insight}
                  </div>
                </div>
              </div>
            ) : (
              !loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-6 opacity-60">
                  <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-800">
                    <Sparkles size={40} />
                  </div>
                  <div className="text-center max-w-sm space-y-2">
                    <h4 className="text-slate-400 font-medium">Aguardando Análise</h4>
                    <p className="text-sm">Selecione os filtros ao lado e clique em gerar para receber insights estratégicos.</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Rodapé Decorativo */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        </div>
      </div>

    </div>
  );
}