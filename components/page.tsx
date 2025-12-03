'use client';

import { Sidebar } from '@/components/Sidebar';
import { MetricCard } from '@/components/MetricCard';
import { CampaignForm } from '@/components/CampaignForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Dados fictícios para o gráfico (depois vem do Supabase)
const data = [
  { name: 'Seg', leads: 4 },
  { name: 'Ter', leads: 7 },
  { name: 'Qua', leads: 12 },
  { name: 'Qui', leads: 8 },
  { name: 'Sex', leads: 15 },
  { name: 'Sab', leads: 10 },
  { name: 'Dom', leads: 6 },
];

export default function Home() {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Geral</h1>
            <p className="text-slate-400">Bem-vindo ao sistema de inteligência da Fly Automação.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 text-sm">Sistema Online</span>
          </div>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total de Leads" value="1,248" trend="+12% esse mês" />
          <MetricCard title="Leads Quentes" value="86" trend="+5% essa semana" />
          <MetricCard title="Agendamentos" value="24" trend="+8% hoje" />
          <MetricCard title="Taxa de Resposta" value="38%" trend="-2% vs média" isPositive={false} />
        </div>

        {/* Área Principal (Gráfico + Campanha) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfico */}
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-white font-bold mb-6">Fluxo de Entrada (Últimos 7 dias)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campanha Rápida */}
          <div className="lg:col-span-1">
             <CampaignForm />
          </div>
        </div>

        {/* Tabela Recente (Mockup Visual) */}
        <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-white font-bold">Últimos Leads Ativos</h3>
          </div>
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Interesse</th>
                <th className="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">Marini</td>
                <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20">Quente</span></td>
                <td className="px-6 py-4">Investimento (Itapema)</td>
                <td className="px-6 py-4">95</td>
              </tr>
              <tr className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-white">João Silva</td>
                <td className="px-6 py-4"><span className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs border border-yellow-500/20">Morno</span></td>
                <td className="px-6 py-4">Moradia (Porto Belo)</td>
                <td className="px-6 py-4">60</td>
              </tr>
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}