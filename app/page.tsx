import { Sidebar } from '@/components/Sidebar';
import { AdvancedMetric } from '@/components/AdvancedMetric';
import { AreaTrendChart, CityBarChart, ProfilePieChart, QualityRadarChart } from '@/components/RealEstateCharts';
import { getLeads } from '@/lib/notion';
// ADICIONADO: Import do Link
import Link from 'next/link'; 
import { 
  Bot, MapPin, TrendingUp, Users, Wallet, Zap, Activity, Target, BrainCircuit,
  CalendarCheck, Archive, Phone, CheckCircle2, Percent, DollarSign
} from 'lucide-react';

export const revalidate = 0;

export default async function Home() {
  const leads = await getLeads();

  // --- PROCESSAMENTO DE DADOS ---
  const totalLeads = leads.length;
  
  // 1. Métricas de Funil (Status)
  const normalize = (s: string) => s ? s.toLowerCase() : '';

  const leadsEmContato = leads.filter((l: any) => {
    const s = normalize(l.status);
    return s.includes('contato') || s === 'contactado';
  }).length;

  const leadsQualificados = leads.filter((l: any) => normalize(l.status).includes('qualificado')).length;
  
  const reunioesAgendadas = leads.filter((l: any) => 
    normalize(l.status).includes('agendada') || normalize(l.status).includes('marcada')
  ).length;
  
  const leadsArquivados = leads.filter((l: any) => 
    normalize(l.status).includes('arquivado') || normalize(l.status).includes('descartado')
  ).length;

  // 2. Taxa de Conversão para Agendamento
  const leadsAtivos = totalLeads - leadsArquivados;
  const totalReunioes = leads.filter((l: any) => normalize(l.status).includes('agendada') || normalize(l.status).includes('feita')).length;
  const taxaAgendamento = leadsAtivos > 0 ? Math.round((totalReunioes / leadsAtivos) * 100) : 0;

  // 3. Ticket Médio (Baseado na extração do resumo)
  const leadsComValor = leads.filter((l: any) => l.orcamento > 0);
  const somaValores = leadsComValor.reduce((acc: number, l: any) => acc + l.orcamento, 0);
  
  const ticketMedio = leadsComValor.length > 0 
    ? somaValores / leadsComValor.length 
    : 450000; 

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(val);
  };

  const leadsQuentes = leads.filter((l: any) => (l.leadScore || 0) >= 70).length;

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
    { subject: 'Qualificação', A: leadsQualificados > 0 ? 80 : 40, fullMark: 100 },
    { subject: 'Agendamento', A: Math.min(taxaAgendamento * 3, 100), fullMark: 100 },
    { subject: 'Perfil Ideal', A: profileCount['Investidor'] ? 85 : 50, fullMark: 100 },
    { subject: 'Ativação', A: 90, fullMark: 100 },
  ];

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen custom-scrollbar">
        
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <AdvancedMetric 
            title="Ticket Médio (Demanda)"
            value={formatMoney(ticketMedio)}
            subValue="Baseado em Resumos"
            isPositive={true}
            icon={<DollarSign size={20} />}
            color="emerald"
          />
          <AdvancedMetric 
            title="Taxa de Agendamento"
            value={`${taxaAgendamento}%`}
            subValue={`${totalReunioes} reuniões`}
            trend="Conversão"
            trendValue={taxaAgendamento > 10 ? "Boa" : "Regular"}
            isPositive={taxaAgendamento > 10}
            icon={<Percent size={20} />}
            color="blue"
          />
          <AdvancedMetric 
            title="Total de Leads"
            value={totalLeads.toString()}
            subValue={`${leadsArquivados} arquivados`}
            trend="Base Total"
            isPositive={true}
            icon={<Users size={20} />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <AdvancedMetric 
            title="Leads Quentes"
            value={leadsQuentes.toString()}
            subValue="Score > 70"
            trend="Prioridade"
            isPositive={true}
            icon={<Zap size={20} />}
            color="orange"
          />
          <AdvancedMetric 
            title="Em Contato"
            value={leadsEmContato.toString()}
            subValue="Nutrição Inicial"
            icon={<Phone size={20} />}
            color="blue"
          />
          <AdvancedMetric 
            title="Reuniões Agendadas"
            value={reunioesAgendadas.toString()}
            subValue="Próximos passos"
            isPositive={true}
            icon={<CalendarCheck size={20} />}
            color="emerald"
          />
          <AdvancedMetric 
            title="Arquivados / Perdidos"
            value={leadsArquivados.toString()}
            subValue="Fora do Pipeline"
            isPositive={false}
            icon={<Archive size={20} />}
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <MapPin className="text-pink-500" size={16} /> Regiões de Interesse
            </h3>
            <div className="overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
               <CityBarChart data={cityData} />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Users className="text-yellow-500" size={16} /> Perfil do Cliente
            </h3>
            <ProfilePieChart data={profileData} />
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/10 rounded-2xl p-6 flex flex-col">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <BrainCircuit size={16} /> IA Insights
            </h3>
            <div className="space-y-3 flex-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed shadow-sm">
                <span className="text-emerald-400 font-bold block mb-1">🚀 Análise de Valor</span> 
                O ticket médio identificado nos resumos é de <b>{formatMoney(ticketMedio)}</b>. Perfil de compra qualificado.
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed shadow-sm">
                <span className="text-blue-400 font-bold block mb-1">📊 Funil</span> 
                Você tem <b>{leadsEmContato}</b> leads em fase de contato. Verifique o Kanban para avançar para qualificação.
              </div>
            </div>
            
            {/* LINK CORRIGIDO PARA INSIGHTS */}
            <Link 
              href="/insights"
              className="w-full mt-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20 transition-all flex items-center justify-center hover:scale-[1.02]"
            >
              Gerar Relatório Completo
            </Link>
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