import { Sidebar } from '@/components/Sidebar';
import { LeadsTable } from '@/components/LeadsTable';
import { getLeads } from '@/lib/notion';

export const revalidate = 0;

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Gestão de Leads</h1>
        <LeadsTable initialLeads={leads} />
      </main>
    </div>
  );
}