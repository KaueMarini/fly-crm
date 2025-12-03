import Link from 'next/link';
import { LayoutDashboard, Users, MessageSquare, Rocket, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          🦅 Fly<span className="text-blue-500">CRM</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" active />
        <NavItem href="/leads" icon={<Users size={20} />} label="Gestão de Leads" />
        <NavItem href="/chat" icon={<MessageSquare size={20} />} label="Conversas IA" />
        <NavItem href="/campaigns" icon={<Rocket size={20} />} label="Disparador" />
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavItem href="/settings" icon={<Settings size={20} />} label="Configurações" />
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active = false }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}