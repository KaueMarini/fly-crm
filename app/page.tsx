import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { DashboardChart } from '@/components/DashboardChart';
import { getLeads } from '@/lib/notion';
import { SummaryCell } from '@/components/SummaryCell';
import { Wallet, Building2, User, MapPin } from 'lucide-react';

export const revalidate = 0;

export default async function Home() {
  const leads = await getLeads();

  // Cálculos Básicos
  const totalLeads = leads.length;
  
  // Segurança: Garante que status/leadScoreTag existam antes de comparar
  const leadsQuentes = leads.filter((l: any) => l.leadScoreTag?.toLowerCase().includes('quente')).length;
  const leadsMornos = leads.filter((l: any) => l.leadScoreTag?.toLowerCase().includes('morno')).length;
  
  const taxaQualidade = totalLeads > 0 ? Math.round((leadsQuentes / totalLeads) * 100) : 0;

  const chartData = getChartData(leads);
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Geral</h1>
            <p className="text-slate-400 mt-1">Inteligência em tempo real via Notion.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-xs font-medium uppercase tracking-wide">Online</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total de Leads" value={totalLeads.toString()} trend="Base total" />
          <MetricCard title="Leads Quentes" value={leadsQuentes.toString()} trend="Alta prioridade" />
          <MetricCard title="Leads Mornos" value={leadsMornos.toString()} trend="Em nutrição" />
          <MetricCard 
            title="Qualidade da Base" 
            value={`${taxaQualidade}%`} 
            trend={taxaQualidade > 30 ? "Saudável" : "Atenção"} 
            isPositive={taxaQualidade > 30} 
          />
        </div>

        <div className="mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg w-full">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            Fluxo de Entrada (7 Dias)
          </h3>
          <div className="h-[350px] w-full">
            <DashboardChart data={chartData} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
              Últimos Leads Ativos
            </h3>
          </div>
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Perfil</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Resumo</th>
                <th className="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recentLeads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{lead.nome}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      lead.perfil === 'Investidor' ? 'bg-purple-950/30 text-purple-300 border-purple-500/20' :
                      lead.perfil === 'Moradia' ? 'bg-orange-950/30 text-orange-300 border-orange-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {lead.perfil === 'Investidor' && <Wallet size={11} />}
                      {lead.perfil === 'Moradia' && <Building2 size={11} />}
                      {lead.perfil === 'Geral' && <User size={11} />}
                      {lead.perfil}
                    </span>
                  </td>

                  {/* --- CORREÇÃO DO ERRO AQUI --- */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {/* Verifica se existe lead.cidades E se é um array antes de dar map */}
                      {(lead.cidades || []).length > 0 ? (
                          (lead.cidades || []).map((city: string, idx: number) => (
                            <span key={idx} className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                              <MapPin size={9} className="text-pink-500" />
                              {city}
                            </span>
                          ))
                      ) : (
                        <span className="text-slate-600 text-xs">-</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <SummaryCell content={lead.interesse} type="text" />
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${
                        lead.leadScoreTag?.toLowerCase().includes('quente') ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                        lead.leadScoreTag?.toLowerCase().includes('morno') ? 'bg-yellow-950/30 text-yellow-400 border-yellow-500/20' :
                        'bg-blue-950/30 text-blue-400 border-blue-500/20'
                      }`}>
                        {lead.leadScoreTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    
    const count = leads.filter((l: any) => {
      if (!l.createdAt) return false;
      return l.createdAt.startsWith(dateStr);
    }).length;

    return { name: dayName, leads: count };
  });
}