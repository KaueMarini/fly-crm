import { Sidebar } from '@/components/Sidebar';
import { getLeads } from '@/lib/notion';
import { LeadsTable } from '@/components/LeadsTable';

// Garante que o Next.js sempre busque dados novos no Notion
export const revalidate = 0; 

export default async function LeadsPage() {
  // Busca os dados no servidor (Server Component)
  const leads = await getLeads();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Leads</h1>
            <p className="text-slate-400 mt-1">Gerencie, filtre e analise sua base de contatos.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Indicador de Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 text-xs font-medium uppercase tracking-wide">
                Sincronizado
              </span>
            </div>
          </div>
        </div>
        
        {/* Tabela Interativa (Client Component) */}
        <LeadsTable initialLeads={leads} />
        
      </main>
    </div>
  );
}