import { Sidebar } from '@/components/Sidebar';
import { getLeads } from '@/lib/notion';
import { SummaryCell } from '@/components/SummaryCell'; // Importe o novo componente

export const revalidate = 0; 

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Leads</h1>
            <p className="text-slate-400 mt-1">Sincronizado com Notion em tempo real.</p>
          </div>
          <div className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg border border-slate-800 font-mono text-sm">
            Total: <span className="text-white font-bold">{leads.length}</span>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4 w-1/3">Resumo</th>
                  <th className="px-6 py-4">Lead Score</th>
                  <th className="px-6 py-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum lead encontrado ou erro na conexão.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-blue-400 font-medium">
                        {lead.telefone}
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {lead.nome}
                      </td>
                      <td className="px-6 py-4">
                        {/* Novo componente de resumo interativo */}
                        <SummaryCell content={lead.interesse} />
                      </td>
                      <td className="px-6 py-4">
                        {/* Lógica Visual de Status (Texto em vez de barra) */}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          lead.status.toLowerCase().includes('quente') 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : lead.status.toLowerCase().includes('morno')
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}