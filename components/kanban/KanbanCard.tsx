import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Archive, User } from 'lucide-react';

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
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm hover:border-blue-500/50 hover:shadow-lg hover:bg-slate-800/90 group relative cursor-grab active:cursor-grabbing transition-all select-none"
    >
      {/* Botão de Arquivar (Hover) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) onDelete(lead.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Arquivar Lead"
      >
        <Archive size={16} />
      </button>

      {/* Badges */}
      <div className="mb-3 flex gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded border font-bold tracking-wide ${
            lead.score > 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          SCORE: {lead.score}
        </span>
      </div>
      
      {/* Nome e Info */}
      <h4 className="text-white font-bold text-sm mb-1 truncate pr-8">{lead.nome}</h4>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Phone size={12} /> <span className="truncate max-w-[90px]">{lead.telefone || '---'}</span>
        </div>
        
        {/* Badge de Perfil Compacta */}
        {lead.perfil && lead.perfil !== 'Geral' && (
           <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
             <User size={10} /> {lead.perfil.substring(0,3).toUpperCase()}
           </div>
        )}
      </div>
    </div>
  );
}