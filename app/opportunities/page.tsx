import { Sidebar } from '@/components/Sidebar';
import { SmartMatch } from '@/components/SmartMatch';
import { getLeads } from '@/lib/notion';
import { Target } from 'lucide-react';

export const revalidate = 0;

export default async function OpportunitiesPage() {
  const leads = await getLeads();

  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-hidden h-screen">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Target className="text-blue-500" />
            Smart Match <span className="text-slate-600 text-lg font-light">| Cruzamento de Oportunidades</span>
          </h1>
          <p className="text-slate-400 mt-1 ml-9">
            Selecione um imóvel da carteira para encontrar os compradores ideais na sua base.
          </p>
        </header>

        <SmartMatch leads={leads} />
      </main>
    </div>
  );
}