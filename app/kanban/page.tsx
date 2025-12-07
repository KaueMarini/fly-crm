import { Sidebar } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { getLeads } from '@/lib/notion'; 

export const revalidate = 0;

export default async function KanbanPage() {
  const leads = await getLeads();

  // Mapeia o texto do Notion para o ID da Coluna no código
  const mapStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('arquivado')) return 'arquivado';
    if (s.includes('feito') || s.includes('feita')) return 'reuniao_ok'; // Reunião Feita
    if (s.includes('agendada')) return 'reuniao_ag'; // Reunião Agendada
    if (s.includes('qualificado')) return 'qualificado';
    if (s.includes('contato')) return 'contato'; // Em Contato
    
    return 'contato'; // Padrão se não achar (ou 'novo' se tiver essa coluna)
  };

  const kanbanLeads = leads.map((l: any) => ({
     ...l,
     status: mapStatus(l.status), 
  }));

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="p-8 pb-0">
           <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
             Pipeline de Vendas
           </h1>
           <p className="text-slate-400 mt-1 mb-6 ml-5">Gerencie seu funil comercial visualmente.</p>
        </div>
         <div className="flex-1 overflow-hidden px-8 pb-8">
            <KanbanBoard initialLeads={kanbanLeads} />
         </div>
      </main>
    </div>
  );
}