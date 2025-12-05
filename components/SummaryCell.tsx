'use client';

import { useState } from 'react';
import { X, FileText, MapPin } from 'lucide-react';

interface SummaryCellProps {
  content: string;
  type?: 'text' | 'location';
}

export function SummaryCell({ content, type = 'text' }: SummaryCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Verifica se o conteúdo é vazio ou padrão para mostrar apenas um traço
  if (!content || content === 'Sem interesse registrado' || content === 'Não informada') {
    return <span className="text-slate-600">-</span>;
  }

  const Icon = type === 'location' ? MapPin : FileText;

  return (
    <>
      {/* Botão na Tabela */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 text-left hover:bg-slate-800 p-1.5 rounded-lg transition-all max-w-[180px]"
      >
        <Icon size={14} className={`${type === 'location' ? 'text-pink-500' : 'text-slate-500'} group-hover:text-blue-400 shrink-0`} />
        <span className="truncate text-slate-400 group-hover:text-slate-200 text-xs">
          {content}
        </span>
      </button>

      {/* Modal (Caixa Flutuante) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Icon size={18} className={type === 'location' ? 'text-pink-500' : 'text-blue-500'} />
                {type === 'location' ? 'Detalhes da Localização' : 'Resumo do Lead'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                {content}
              </p>
            </div>

            {/* Rodapé */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-right">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
          
          {/* Fecha ao clicar no fundo escuro */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}