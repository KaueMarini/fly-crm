import { Sidebar } from '@/components/Sidebar';
import { AdvancedMetric } from '@/components/AdvancedMetric';
import { AreaTrendChart, CityBarChart, ProfilePieChart, QualityRadarChart } from '@/components/RealEstateCharts';
import { getLeads } from '@/lib/notion';
import { 
  Bot, MapPin, TrendingUp, Users, Wallet, Zap, Activity, Target, BrainCircuit
} from 'lucide-react';

export const revalidate = 0;

export default async function Home() {
  const leads = await getLeads();

  // --- DADOS ---
  const totalLeads = leads.length;
  // Ajuste nos scores para evitar erro se não houver leadScore
  const leadsQuentes = leads.filter((l: any) => (l.leadScore || 0) >= 70).length;
  
  // Financeiro Estimado (Simulado com base no perfil)
  const estimatedPipelineValue = leads.reduce((acc: number, lead: any) => {
    const ticket = lead.perfil === 'Investidor' ? 600000 : 400000;
    const probability = (lead.leadScore || 10) / 100; 
    return acc + (ticket * probability);
  }, 0);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(val);
  };

  // Dados Gráficos
  const chartData = getChartData(leads);
  
  const cityCount: Record<string, number> = {};
  leads.forEach((l: any) => l.cidades.forEach((c: string) => {
    if (c && c !== 'Não informada') cityCount[c] = (cityCount[c] || 0) + 1;
  }));
  
  const cityData = Object.entries(cityCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); 

  const profileCount: Record<string, number> = {};
  leads.forEach((l: any) => {
    const p = l.perfil || 'Indefinido';
    profileCount[p] = (profileCount[p] || 0) + 1;
  });
  const profileData = Object.entries(profileCount).map(([name, value]) => ({ name, value }));

  const avgScore = Math.round(leads.reduce((a:any, b:any) => a + (b.leadScore || 0), 0) / (totalLeads || 1));
  const radarData = [
    { subject: 'Engajamento', A: avgScore, fullMark: 100 },
    { subject: 'Perfil', A: profileCount['Investidor'] ? 80 : 50, fullMark: 100 },
    { subject: 'Localização', A: 70, fullMark: 100 },
    { subject: 'Orçamento', A: 60, fullMark: 100 },
    { subject: 'Rapidez', A: 85, fullMark: 100 },
  ];

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        
        {/* HEADER */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Painel de Controle
            </h1>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Activity size={14} className="text-emerald-400" />
              Visão Geral da Imobiliária
            </p>
          </div>
          <div className="hidden md:block bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-slate-500">
             ATUALIZADO: {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
          </div>
        </header>

        {/* METRICAS PRINCIPAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <AdvancedMetric 
            title="Pipeline Ponderado"
            value={formatMoney(estimatedPipelineValue)}
            subValue="Previsão Realista"
            isPositive={true}
            icon={<Wallet size={20} />}
            color="emerald"
          />
          <AdvancedMetric 
            title="Total de Leads"
            value={totalLeads.toString()}
            subValue="Base Ativa"
            trend="+3 essa semana"
            isPositive={true}
            icon={<Users size={20} />}
            color="blue"
          />
          <AdvancedMetric 
            title="Leads Quentes"
            value={leadsQuentes.toString()}
            subValue="Prioridade Alta"
            trend="Score > 70"
            isPositive={true}
            icon={<Zap size={20} />}
            color="orange"
          />
          <AdvancedMetric 
            title="IA Response Rate"
            value="98%"
            subValue="Disponibilidade"
            isPositive={true}
            icon={<Bot size={20} />}
            color="purple"
          />
        </div>

        {/* GRÁFICOS PRINCIPAIS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* FLUXO (2/3 da largura) */}
          <div className="xl:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <TrendingUp className="text-blue-500" size={18} />
                Fluxo de Novos Leads (7 Dias)
              </h3>
            </div>
            <div className="h-[280px]">
              <AreaTrendChart data={chartData} />
            </div>
          </div>

          {/* RADAR (1/3 da largura) */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Target className="text-purple-500" size={18} />
              Qualidade da Base
            </h3>
            <div className="flex-1 min-h-[220px]">
              <QualityRadarChart data={radarData} />
            </div>
          </div>
        </div>

        {/* INTELIGÊNCIA DE MERCADO (LINHA INFERIOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CIDADES */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <MapPin className="text-pink-500" size={16} /> Regiões de Interesse
            </h3>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
               <CityBarChart data={cityData} />
            </div>
          </div>

          {/* PERFIL */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Users className="text-yellow-500" size={16} /> Perfil do Cliente
            </h3>
            <ProfilePieChart data={profileData} />
          </div>

        </div>
      </main>
    </div>  
  );
}

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
    return { name: dayName, leads: count };
  });
}