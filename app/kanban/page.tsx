import { Sidebar } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { getLeads, getPipelineStages, getPipelines } from '@/lib/notion'; 

export const revalidate = 0;

export default async function KanbanPage() {
  const [leads, stages, funnelsList] = await Promise.all([
    getLeads(),
    getPipelineStages(),
    getPipelines()
  ]);

  // Monta a estrutura completa (Funis + Colunas)
  // No Notion simples, todos os funis compartilham as mesmas colunas de Status.
  // Em um sistema SQL, cada funil teria suas colunas. Aqui, replicamos as colunas para todos.
  const fullPipelines = funnelsList.reduce((acc: any, funil: any) => {
      acc[funil.id] = {
          id: funil.id,
          title: funil.title,
          stages: stages // Todas as colunas disponíveis (Novo, Contato, etc)
      };
      return acc;
  }, {});

  // Se não tiver nada, cria um padrão
  if (Object.keys(fullPipelines).length === 0) {
      fullPipelines['Vendas'] = { 
          id: 'Vendas', title: 'Vendas (Padrão)', 
          stages: stages.length ? stages : [{id:'Novo Lead', title:'Novo Lead', color:'bg-blue-500'}] 
      };
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 h-screen overflow-hidden flex flex-col">
        <div className="p-8 pb-0">
           <h1 className="text-3xl font-bold text-white tracking-tight">Pipeline Dinâmico</h1>
        </div>
         <div className="flex-1 overflow-hidden px-8 pb-8">
            <KanbanBoard 
                initialLeads={leads} 
                serverPipelines={fullPipelines} 
            />
         </div>
      </main>
    </div>
  );
}