import { Sidebar } from '@/components/Sidebar';
import { FocusSession } from '@/components/FocusSession';
import { getLeads } from '@/lib/notion';

export const revalidate = 0;

export default async function FocusPage() {
  const leads = await getLeads();

  // FILTRO DO MODO FOCO:
  // Mostra apenas leads que NÃO foram descartados nem adiados.
  // Ou seja: Status Foco == 'Pendente' (ou vazio)
  const priorityLeads = leads.filter((l: any) => 
    l.statusFoco !== 'Descartado' && l.statusFoco !== 'Adiado'
  );

  return (
    <div className="flex bg-[#020617] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden flex flex-col justify-center">
        <FocusSession leads={priorityLeads} />
      </main>
    </div>
  );
}