'use client'; 

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { 
  LayoutDashboard, 
  Users, 
  Rocket, 
  Settings, 
  LogOut, 
  Lightbulb, 
  MessageSquare,
  SquareKanban // Ícone para o Kanban
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-slate-950 h-screen fixed left-0 top-0 text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl z-50">
      
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          🦅 Fly<span className="text-blue-500">CRM</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem 
          href="/" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={isActive('/')} 
        />
        
        <div className="pt-4 pb-2 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Vendas
        </div>

        <NavItem 
          href="/kanban" 
          icon={<SquareKanban size={20} />} 
          label="Pipeline / Funil" 
          active={isActive('/kanban')} 
        />
        <NavItem 
          href="/leads" 
          icon={<Users size={20} />} 
          label="Lista de Leads" 
          active={isActive('/leads')} 
        />
        
        <div className="pt-4 pb-2 pl-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Inteligência
        </div>

        <NavItem 
          href="/insights" 
          icon={<Lightbulb size={20} />} 
          label="Insights IA" 
          active={isActive('/insights')} 
        />
        <NavItem 
          href="/chat" 
          icon={<MessageSquare size={20} />} 
          label="Conversas" 
          active={isActive('/chat')} 
        />
        <NavItem 
          href="/campaigns" 
          icon={<Rocket size={20} />} 
          label="Disparador" 
          active={isActive('/campaigns')} 
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavItem 
          href="/settings" 
          icon={<Settings size={20} />} 
          label="Configurações" 
          active={isActive('/settings')} 
        />
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800/50 hover:text-red-300 rounded-lg w-full transition-all duration-200 cursor-pointer">
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
          : 'hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}