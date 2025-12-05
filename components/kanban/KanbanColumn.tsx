'use client';

import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: any;
  leads: any[];
  onDelete: (id: string) => void; // Nova prop
}

export function KanbanColumn({ column, leads, onDelete }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-bold text-slate-300 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${column.color}`}></span>
          {column.title}
        </h3>
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-md border border-slate-700">
          {leads.length}
        </span>
      </div>

      <div 
        ref={setNodeRef} 
        className="flex-1 bg-slate-900/50 rounded-xl p-2 border border-slate-800/50 space-y-3 min-h-[200px]"
      >
        {leads.map((lead) => (
          <KanbanCard 
            key={lead.id} 
            lead={lead} 
            onDelete={onDelete} // Repassando
          />
        ))}
      </div>
    </div>
  );
}