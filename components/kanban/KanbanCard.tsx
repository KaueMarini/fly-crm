import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Building2, Trash2 } from 'lucide-react'; // Importe Trash2

interface KanbanCardProps {
  lead: any;
  onDelete: (id: string) => void;
}

export function KanbanCard({ lead, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
    data: { ...lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm hover:border-blue-500/50 group relative cursor-grab active:cursor-grabbing"
    >
      {/* Botão de Excluir (aparece no hover) */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // Impede que inicie o drag ao clicar no botão
          onDelete(lead.id);
        }}
        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Excluir card"
      >
        <Trash2 size={14} />
      </button>

      <div className="mb-2 pr-6"> {/* pr-6 para não bater no botão de excluir */}
        <span className={`text-[10px] px-2 py-0.5 rounded border ${
            lead.score > 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          Score: {lead.score || 0}
        </span>
      </div>
      
      <h4 className="text-white font-medium text-sm mb-1 truncate">{lead.nome}</h4>
      
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Phone size={12} /> {lead.telefone || '---'}
        </div>
      </div>
    </div>
  );
}