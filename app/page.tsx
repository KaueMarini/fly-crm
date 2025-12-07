import { Sidebar } from '@/components/Sidebar';
import { AdvancedMetric } from '@/components/AdvancedMetric';
import { AreaTrendChart, CityBarChart, ProfilePieChart, QualityRadarChart } from '@/components/RealEstateCharts';
import { getLeads } from '@/lib/notion';
import { 
  Bot, Building2, MapPin, TrendingUp, Users, MessageSquare, 
  Wallet, Zap, Activity, Target, BrainCircuit, Globe 
} from 'lucide-react';

export const revalidate = 0;

export default async function Home() {
  const leads = await getLeads();

  // --- PROCESSAMENTO DE DADOS (INTELIGÊNCIA) ---

  // 1. KPI: Totais e Scores
  const totalLeads = leads.length;
  const leadsQuentes = leads.filter((l: any) => l.leadScore >= 70).length;
  const leadsMornos = leads.filter((l: any) => l.leadScore >= 40 && l.leadScore < 70).length;
  
  // 2. FINANCEIRO (Estimativa: Ticket Médio de 500k para Investidor, 350k para Moradia)
  const estimatedPipelineValue = leads.reduce((acc: number, lead: any) => {
    const ticket = lead.perfil === 'Investidor' ? 500000 : 350000;
    // Ponderar pelo Score (Probabilidade de Fechamento)
    const probability = lead.leadScore / 100; 
    return acc + (ticket * probability);
  }, 0);

  // Formata para BRL (ex: R$ 1.2M)
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(val);
  };

  // 3. GRÁFICOS
  const chartData = getChartData(leads);
  
  // Cidades
  const cityCount: Record<string, number> = {};
  leads.forEach((l: any) => l.cidades.forEach((c: string) => {
    if (c && c !== 'Não informada') cityCount[c] = (cityCount[c] || 0) + 1;
  }));
  const cityData = Object.entries(cityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Perfil
  const profileCount: Record<string, number> = {};
  leads.forEach((l: any) => {
    const p = l.perfil || 'Não definido';
    profileCount[p] = (profileCount[p] || 0) + 1;
  });
  const profileData = Object.entries(profileCount).map(([name, value]) => ({ name, value }));

  // Radar (Qualidade da Base) - Simulando médias baseadas nos dados reais
  const avgScore = Math.round(leads.reduce((a:any, b:any) => a + b.leadScore, 0) / (totalLeads || 1));
  const radarData = [
    { subject: 'Engajamento', A: avgScore, fullMark: 100 },
    { subject: 'Perfil', A: profileCount['Investidor'] ? 85 : 60, fullMark: 100 }, // Investidor vale mais pts ficticios
    { subject: 'Localização', A: 75, fullMark: 100 },
    { subject: 'Orçamento', A: 65, fullMark: 100 }, // Simulado
    { subject: 'Rapidez', A: 90, fullMark: 100 }, // Simulado
  ];

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Center</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              Monitoramento em Tempo Real • Base Atualizada
            </p>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-slate-400">
                L. UPDATE: {new Date().toLocaleTimeString()}
             </div>
          </div>
        </header>

        {/* --- GRID PRINCIPAL (BENTO GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* 1. Métrica: Pipeline Value (O Grande Número) */}
          <AdvancedMetric 
            title="Valor em Pipeline (Ponderado)"
            value={formatMoney(estimatedPipelineValue)}
            subValue="Potencial Estimado"
            trend="Previsão 30d"
            trendValue="+12%"
            isPositive={true}
            icon={<Wallet size={20} />}
            color="emerald"
          />

          {/* 2. Métrica: Total Leads */}
          <AdvancedMetric 
            title="Total de Leads"
            value={totalLeads.toString()}
            subValue="Contatos Ativos"
            trend="vs. semana passada"
            trendValue="+5"
            isPositive={true}
            icon={<Users size={20} />}
            color="blue"
          />

          {/* 3. Métrica: Taxa de Qualificação */}
          <AdvancedMetric 
            title="Leads Quentes"
            value={leadsQuentes.toString()}
            subValue={`${Math.round((leadsQuentes/totalLeads)*100 || 0)}% da base`}
            trend="Qualidade"
            trendValue="Alta"
            isPositive={true}
            icon={<Zap size={20} />}
            color="orange"
          />

          {/* 4. Métrica: IA / Bot */}
          <AdvancedMetric 
            title="IA Response Rate"
            value="98.5%"
            subValue="24/7 Ativo"
            trend="Economia Tempo"
            trendValue="45h"
            isPositive={true}
            icon={<Bot size={20} />}
            color="purple"
          />
        </div>

        {/* --- LINHA 2: GRÁFICOS GRANDES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* GRÁFICO 1: FLUXO DE ENTRADA (Ocupa 2 colunas) */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="text-blue-400" size={18} />
                  Fluxo de Entrada & Engajamento
                </h3>
                <p className="text-slate-500 text-xs mt-1">Novos leads e interações nos últimos 7 dias.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Live Data</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <AreaTrendChart data={chartData} />
            </div>
          </div>

          {/* GRÁFICO 2: QUALIDADE DA BASE (Radar) */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="text-purple-400" size={18} />
                Radar de Qualidade
              </h3>
              <p className="text-slate-500 text-xs mt-1">Análise multidimensional da base.</p>
            </div>
            <div className="flex-1">
              <QualityRadarChart data={radarData} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400">
              <span>Score Médio: <b className="text-white">{avgScore}</b></span>
              <span>Engajamento: <b className="text-emerald-400">Alto</b></span>
            </div>
          </div>
        </div>

        {/* --- LINHA 3: INTELIGÊNCIA DE MERCADO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card: Cidades */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <MapPin className="text-pink-500" size={16} /> Hotspots (Cidades)
            </h3>
            <CityBarChart data={cityData} />
          </div>

          {/* Card: Perfil */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Users className="text-yellow-500" size={16} /> Segmentação
            </h3>
            <ProfilePieChart data={profileData} />
          </div>

        </div>
      </main>
    </div>  
  );
}

// Função auxiliar para dados do gráfico de linha (Simulada para visual)
function getChartData(leads: any[]) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return last7Days.map(date => {
    const dayName = days[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    const count = leads.filter((l: any) => l.createdAt && l.createdAt.startsWith(dateStr)).length;
    // Simula um valor mínimo para o gráfico não ficar vazio se não tiver leads hoje
    return { name: dayName, leads: count }; 
  });
}