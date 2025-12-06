'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Filter, Plus, Loader2, Settings, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Lead, Pipeline } from '@/types/kanban';

export function KanbanBoard({ initialLeads, serverPipelines }: { initialLeads: Lead[], serverPipelines: Record<string, Pipeline> }) {
  
  // Pega o primeiro funil disponível como padrão
  const firstFunnelId = Object.keys(serverPipelines)[0] || 'Vendas';
  
  const [activeFunnel, setActiveFunnel] = useState<string>(firstFunnelId);
  const [pipelines, setPipelines] = useState(serverPipelines);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);

  const currentPipeline = pipelines[activeFunnel] || pipelines[firstFunnelId];

  // --- AÇÕES DE ADMINISTRAÇÃO ---

  const handleCreateFunnel = async () => {
      const name = prompt("Nome do Novo Funil (ex: Pós-Venda):");
      if (!name) return;

      setLoading(true);
      await fetch('/api/pipelines/create', {
          method: 'POST',
          body: JSON.stringify({ name })
      });
      router.refresh();
      setLoading(false);
  };

  const handleCreateStage = async () => {
      const name = prompt("Nome da Nova Coluna (ex: Aguardando):");
      if (!name) return;

      setLoading(true);
      await fetch('/api/pipelines/add-stage', {
          method: 'POST',
          body: JSON.stringify({ name })
      });
      router.refresh();
      setLoading(false);
  };

  // --- MOVIMENTAÇÃO ---

  const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as string;

      // Otimista
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, funil: activeFunnel } : l));
      
      // Salva
      await fetch('/api/leads/update', {
          method: 'POST',
          body: JSON.stringify({ pageId: leadId, status: newStatus })
      });
      router.refresh();
  };

  // --- CRIAR LEAD (Agora pede o funil) ---
  
  const handleAddLead = async () => {
      const nome = prompt("Nome do Lead:");
      if (!nome) return;

      // Cria no funil ATIVO e na primeira coluna dele
      const firstStage = currentPipeline.stages[0].id;
      
      const tempLead: Lead = { 
          id: `temp_${Date.now()}`, nome, telefone: '...', 
          status: firstStage, funil: activeFunnel, 
          leadScoreTag: 'Frio', leadScore: 10, cidade: '', interesse: '', createdAt: '' 
      };

      setLeads(prev => [tempLead, ...prev]);

      await fetch('/api/leads/create', {
          method: 'POST',
          body: JSON.stringify({ nome, status: firstStage, funil: activeFunnel })
      });
      router.refresh();
  };

  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col relative">
        {loading && <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full animate-pulse z-50">Processando...</div>}

        {/* HEADER E CONTROLES */}
        <div className="flex justify-between mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <Filter size={16} /> Funil:
                </span>
                <select 
                    value={activeFunnel} 
                    onChange={(e) => setActiveFunnel(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
                >
                    {Object.values(pipelines).map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
                
                {/* Botão Engrenagem (Admin) */}
                <button onClick={() => setShowAdmin(!showAdmin)} className={`p-2 rounded hover:bg-slate-800 ${showAdmin ? 'text-blue-400' : 'text-slate-500'}`}>
                    <Settings size={18} />
                </button>
            </div>
            
            <button onClick={handleAddLead} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus size={16} /> Novo Lead
            </button>
        </div>

        {/* PAINEL ADMIN (Aparece ao clicar na engrenagem) */}
        {showAdmin && (
            <div className="mb-4 p-4 bg-slate-900/50 border border-blue-900/30 rounded-xl flex gap-4 animate-in slide-in-from-top-2">
                <button onClick={handleCreateFunnel} className="bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded text-xs font-bold flex gap-2 items-center">
                    <Plus size={14}/> Criar Novo Funil
                </button>
                <button onClick={handleCreateStage} className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded text-xs font-bold flex gap-2 items-center">
                    <Plus size={14}/> Criar Nova Coluna
                </button>
            </div>
        )}

        {/* BOARD */}
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
                {currentPipeline?.stages.map(stage => (
                    <KanbanColumn 
                        key={stage.id} 
                        column={stage} 
                        // Filtra leads que pertencem a ESTE funil e ESTA coluna
                        leads={leads.filter(l => l.status === stage.id && l.funil === activeFunnel)} 
                        onDelete={() => {}} 
                    />
                ))}
            </div>
        </DndContext>
    </div>
  );
}