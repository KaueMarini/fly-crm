import { Sidebar } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { getLeads } from '@/lib/notion'; 

export const revalidate = 0;

export default async function KanbanPage() {
  // Buscamos os leads reais
  const leads = await getLeads();

  // Adaptamos os dados para o formato do Kanban
  // Aqui definimos uma lógica simples para distribuir nas colunas se não tiver status definido
  const kanbanLeads = leads.map((l: any) => ({
     ...l,
     // Se o status do notion for "Novo", joga pra coluna 'novo'. Se não, 'contato'.
     // Depois isso virá do banco corretamente.
     status: l.status.toLowerCase().includes('novo') ? 'novo' : 'contato', 
     funil: 'vendas',
     score: l.leadScore || 50
  }));

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="p-8 pb-0">
           <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline de Vendas</h1>
           <p className="text-slate-400 mt-1 mb-6">Gerencie suas oportunidades arrastando os cards.</p>
        </div>
         
         {/* Área do Kanban (ocupa o resto da tela) */}
         <div className="flex-1 overflow-hidden px-8 pb-8">
            <KanbanBoard initialLeads={kanbanLeads} />
         </div>
      </main>
    </div>
  );
}