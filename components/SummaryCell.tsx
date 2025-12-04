'use client';

import { useState } from 'react';
import { X, FileText } from 'lucide-react';

export function SummaryCell({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Se não tiver conteúdo, retorna traço simples
  if (!content || content === 'Sem interesse registrado') {
    return <span className="text-slate-600">-</span>;
  }

  return (
    <>
      {/* Botão na Tabela */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 text-left hover:bg-slate-800 p-1.5 rounded-lg transition-all max-w-[200px]"
      >
        <FileText size={14} className="text-slate-500 group-hover:text-blue-400 shrink-0" />
        <span className="truncate text-slate-400 group-hover:text-slate-200 text-xs">
          {content}
        </span>
      </button>

      {/* Modal / Caixa */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                Resumo do Lead
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
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
          
          {/* Fecha ao clicar fora */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}