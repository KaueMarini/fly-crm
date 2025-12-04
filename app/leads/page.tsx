import { Sidebar } from '@/components/Sidebar';
import { getLeads } from '@/lib/notion';

// Isso garante que a página sempre busque dados novos (sem cache eterno)
export const revalidate = 0; 

export default async function LeadsPage() {
  // 1. Busca os dados reais do Notion
  const leads = await getLeads();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Leads</h1>
            <p className="text-slate-400">Sincronizado com Notion em tempo real.</p>
          </div>
          <div className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-600/20 font-mono text-sm">
            Total: {leads.length} leads
          </div>
        </div>
        
        {/* Tabela */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-slate-200 uppercase font-medium tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum lead encontrado ou erro na conexão.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                        {lead.nome}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {lead.telefone}
                      </td>
                      <td className="px-6 py-4">
                        {/* Lógica de Cores das Tags */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          lead.status === 'Quente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          lead.status === 'Morno' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                          lead.status === 'Frio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-slate-700/50 text-slate-400 border-slate-600'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{lead.cidade}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${Math.min(lead.leadScore, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-white">{lead.leadScore}</span>
                        </div>
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