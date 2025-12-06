import { Sidebar } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { getLeads, getPipelineStages } from '@/lib/notion'; 

export const revalidate = 0;

export default async function KanbanPage() {
  // Busca Leads e Etapas em paralelo
  const [leads, stages] = await Promise.all([
    getLeads(),
    getPipelineStages()
  ]);

  // Monta o Funil Dinâmico com o que veio do Notion
  // Se o Notion estiver vazio, usa um padrão
  const dynamicStages = stages.length > 0 ? stages : [
    { id: 'Novo Lead', title: 'Novo Lead', color: 'bg-blue-500' },
    { id: 'Em Contato', title: 'Em Contato', color: 'bg-yellow-500' }
  ];

  const serverPipeline = {
      id: 'vendas',
      title: 'Pipeline Principal (Notion)',
      stages: dynamicStages
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="p-8 pb-0">
           <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline Dinâmico</h1>
           <p className="text-slate-400 mt-1 mb-6">Sincronizado com as opções de Status do Notion.</p>
        </div>
         <div className="flex-1 overflow-hidden px-8 pb-8">
            <KanbanBoard 
                initialLeads={leads} 
                serverPipeline={serverPipeline} 
            />
         </div>
      </main>
    </div>
  );
}