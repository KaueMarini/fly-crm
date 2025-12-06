'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Filter, Plus, Loader2, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Tipos
type Lead = { id: string; nome: string; status: string; [key:string]: any };
type Stage = { id: string; title: string; color: string; rules?: any };
type Pipeline = { id: string; title: string; stages: Stage[] };

export function KanbanBoard({ initialLeads, serverPipeline }: { initialLeads: Lead[], serverPipeline: Pipeline }) {
  const [pipeline, setPipeline] = useState<Pipeline>(serverPipeline);
  const [leads, setLeads] = useState(initialLeads);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);

  // --- Função: Criar Nova Coluna (Persistente) ---
  const handleAddStage = async () => {
      const title = prompt("Nome da nova etapa:");
      if (!title) return;

      // Otimista
      const newStage = { id: title, title, color: 'bg-slate-500' };
      setPipeline(prev => ({ ...prev, stages: [...prev.stages, newStage] }));

      // API Notion
      await fetch('/api/pipelines/add-stage', {
          method: 'POST',
          body: JSON.stringify({ name: title })
      });
      router.refresh();
  };

  // --- Função Mover Lead ---
  const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as string;
      
      if (leads.find(l => l.id === leadId)?.status === newStatus) return;

      // Otimista
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      setLoading(true);

      try {
          await fetch('/api/leads/update', {
              method: 'POST',
              body: JSON.stringify({ pageId: leadId, status: newStatus }) // O ID da coluna é o próprio nome no Notion
          });
          router.refresh();
      } catch(e) {
          alert("Erro ao salvar");
      } finally {
          setLoading(false);
      }
  };
  
  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col relative">
        {loading && <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full animate-pulse z-50">Salvando...</div>}

        {/* Header */}
        <div className="flex justify-between mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h3 className="text-white font-bold flex items-center gap-2">
               {pipeline.title}
            </h3>
            <div className="flex gap-2">
               {isAdminMode && <button onClick={handleAddStage} className="bg-purple-600 px-3 py-1 rounded text-white text-xs">+ Coluna</button>}
               <button onClick={() => setIsAdminMode(!isAdminMode)} className="text-slate-400 p-2 hover:text-white"><Settings size={18}/></button>
            </div>
        </div>

        {/* Board */}
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {pipeline.stages.map(stage => (
                    <KanbanColumn 
                        key={stage.id} 
                        column={stage} 
                        leads={leads.filter(l => l.status === stage.id)} 
                        onDelete={() => {}} // Implementar delete se precisar
                    />
                ))}
            </div>
        </DndContext>
    </div>
  );
}