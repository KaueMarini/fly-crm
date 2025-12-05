'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Filter, Plus } from 'lucide-react';

// --- Definição de Tipos ---
interface Column {
  id: string;
  title: string;
  color: string;
  rules?: {
    requireObs?: boolean;
  };
}

// Configuração dos Funis
const FUNNELS: Record<string, Column[]> = {
  vendas: [
    { id: 'novo', title: 'Novo Lead', color: 'bg-blue-500' },
    { id: 'contato', title: 'Em Contato', color: 'bg-yellow-500' },
    { id: 'qualificado', title: 'Qualificado', color: 'bg-purple-500', rules: { requireObs: true } },
    { id: 'proposta', title: 'Proposta Enviada', color: 'bg-orange-500' },
    { id: 'fechado', title: 'Venda Fechada', color: 'bg-emerald-500' },
  ],
  locacao: [
    { id: 'novo', title: 'Interessado', color: 'bg-blue-500' },
    { id: 'visita', title: 'Visita Agendada', color: 'bg-yellow-500' },
    { id: 'doc', title: 'Análise Doc', color: 'bg-purple-500' },
    { id: 'alugado', title: 'Contrato Assinado', color: 'bg-emerald-500' },
  ]
};

export function KanbanBoard({ initialLeads }: { initialLeads: any[] }) {
  // --- Estados ---
  const [activeFunnel, setActiveFunnel] = useState<string>('vendas');
  const [leads, setLeads] = useState(initialLeads);
  
  // Estado para controle de Hidratação (Evita erro no Next.js)
  const [isMounted, setIsMounted] = useState(false);

  // Estados para Modais
  const [showObsModal, setShowObsModal] = useState(false);
  const [pendingMove, setPendingMove] = useState<any>(null);

  // --- Efeito de Montagem ---
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Função: Adicionar Manualmente ---
  const handleAddManualLead = () => {
    const nome = prompt("Nome do Lead:");
    if (!nome) return;

    const newLead = {
      id: `manual_${Date.now()}`, // Gera ID temporário
      nome: nome,
      telefone: "Sem telefone",
      status: FUNNELS[activeFunnel][0].id, // Adiciona na primeira etapa do funil atual
      funil: activeFunnel,
      score: 10,
    };

    setLeads((prev) => [newLead, ...prev]);
  };

  // --- Função: Excluir Card ---
  const handleDeleteLead = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este card?")) {
      setLeads((prev) => prev.filter(l => l.id !== id));
    }
  };

  // --- Lógica de Drag & Drop ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id;
    const newStatus = over.id as string;
    const currentLead = leads.find(l => l.id === leadId);

    // Se soltou na mesma coluna, não faz nada
    if (currentLead?.status === newStatus) return;

    // Verifica Regras de Negócio da Coluna Alvo
    const targetColumn = FUNNELS[activeFunnel].find(c => c.id === newStatus);
    
    if (targetColumn?.rules?.requireObs) {
      // Pausa o movimento e pede observação
      setPendingMove({ leadId, newStatus });
      setShowObsModal(true);
      return;
    }

    // Executa movimento
    moveLead(leadId as string, newStatus);
  };

  const moveLead = (id: string, status: string, observation?: string) => {
    setLeads((prev) => 
      prev.map(l => l.id === id ? { ...l, status } : l)
    );
    console.log(`Lead ${id} movido para ${status}. Obs: ${observation || 'Nenhuma'}`);
  };

  const confirmMove = (observation: string) => {
    if (pendingMove) {
      moveLead(pendingMove.leadId, pendingMove.newStatus, observation);
      setPendingMove(null);
      setShowObsModal(false);
    }
  };

  // --- Renderização Segura (Client-Side Only) ---
  if (!isMounted) {
    return null; // Evita renderizar no servidor e causar erro de ID
  }

  return (
    <div className="h-full flex flex-col">
      {/* Barra de Controles */}
      <div className="flex items-center justify-between mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-medium flex items-center gap-2">
            <Filter size={16} /> Funil:
          </span>
          <select 
            value={activeFunnel}
            onChange={(e) => setActiveFunnel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="vendas">Vendas 💰</option>
            <option value="locacao">Locação 🏠</option>
          </select>
        </div>
        
        {/* Botão Novo Card */}
        <button 
          onClick={handleAddManualLead}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Novo Card
        </button>
      </div>

      {/* Área do Kanban (Colunas) */}
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {FUNNELS[activeFunnel].map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              // Filtra apenas os leads que pertencem a esta coluna
              leads={leads.filter(l => l.status === col.id)}
              // Passa a função de deletar para a coluna (que passará para o card)
              onDelete={handleDeleteLead} 
            />
          ))}
        </div>
      </DndContext>

      {/* Modal de Observação Obrigatória */}
      {showObsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-96 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-white font-bold text-lg mb-2">⚠️ Observação Obrigatória</h3>
            <p className="text-slate-400 text-sm mb-4">Para esta etapa, é necessário registrar o motivo:</p>
            <textarea 
              id="obs-input"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white text-sm mb-4 h-24 focus:border-blue-500 outline-none resize-none"
              placeholder="Escreva aqui..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setShowObsModal(false); setPendingMove(null); }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const obs = (document.getElementById('obs-input') as HTMLTextAreaElement).value;
                  if(obs.trim()) confirmMove(obs);
                  else alert("Por favor, escreva uma observação.");
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
              >
                Salvar e Mover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}