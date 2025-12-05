import { Sidebar } from '@/components/Sidebar';
import { InsightsGenerator } from '@/components/InsightsGenerator';

export default function InsightsPage() {
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Inteligência de Mercado
          </h1>
          <p className="text-slate-400">
            Use a IA para descobrir padrões ocultos na sua base de leads e tomar decisões estratégicas.
          </p>
        </header>

        <InsightsGenerator />
      </main>
    </div>
  );
}