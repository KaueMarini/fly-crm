'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Building2, Trash2, GripVertical, User } from 'lucide-react';

interface KanbanCardProps {
  lead: any;
  onDelete: (id: string) => void;
}

export function KanbanCard({ lead, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { ...lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group bg-slate-800 p-4 rounded-xl border border-slate-700/60 shadow-sm hover:shadow-md transition-all
        ${isDragging ? 'rotate-2 scale-105 border-blue-500 shadow-xl z-50' : 'hover:border-slate-600'}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Botão de Excluir (Redesenhado) */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onPointerDown={(e) => {
            e.stopPropagation(); // Impede o drag
            onDelete(lead.id);
          }}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          title="Arquivar Lead"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Tags Superiores */}
      <div className="flex gap-2 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            lead.score > 70 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : lead.score > 40 
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              : 'bg-slate-700/50 text-slate-400 border-slate-600'
        }`}>
          Score: {lead.score || 0}
        </span>
        {lead.funil && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600">
            {lead.funil}
          </span>
        )}
      </div>
      
      {/* Informações Principais */}
      <div className="pr-6">
        <h4 className="text-slate-100 font-semibold text-sm mb-1 truncate">{lead.nome}</h4>
        {lead.empresa && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
              <Building2 size={12} /> 
              <span className="truncate">{lead.empresa}</span>
          </div>
        )}
      </div>
      
      {/* Rodapé do Card */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
            <Phone size={12} className="text-slate-500" /> 
            {lead.telefone || '---'}
        </div>
        {/* Ícone de Drag (Dica visual) */}
        <div className="text-slate-600">
          <GripVertical size={14} />
        </div>
      </div>
    </div>
  );
}