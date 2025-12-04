import { Sidebar } from '@/components/Sidebar';
import { CampaignForm } from '@/components/CampaignForm';

export default function CampaignsPage() {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Central de Disparos</h1>
        <p className="text-slate-400 mb-8">Configure e dispare campanhas de reengajamento via IA.</p>
        
        <div className="max-w-4xl">
          <CampaignForm />
        </div>
      </main>
    </div>
  );
}