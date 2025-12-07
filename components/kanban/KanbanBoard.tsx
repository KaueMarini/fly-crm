"use client";

import { useState, useEffect, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { Search, User, Calendar, Archive, RotateCcw, Undo2, Loader2, BarChart2 } from 'lucide-react';

const COLUMNS = [
  { id: 'contato', title: 'Em Contato', notionStatus: 'Em Contato', color: 'bg-blue-500' },
  { id: 'qualificado', title: 'Qualificado', notionStatus: 'Qualificado', color: 'bg-purple-500' },
  { id: 'reuniao_ag', title: 'Reunião Agendada', notionStatus: 'Reunião Agendada', color: 'bg-pink-500' },
  { id: 'reuniao_ok', title: 'Reunião Feita', notionStatus: 'Reunião Feita', color: 'bg-emerald-500' },
];

export function KanbanBoard({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('Todos');
  const [dateFilter, setDateFilter] = useState('');
  const [minScore, setMinScore] = useState(0); // Filtro de Score (0 a 100)

  useEffect(() => { setIsMounted(true); }, []);

  // --- Mover Card ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const columnId = over.id as string;
    const targetCol = COLUMNS.find(c => c.id === columnId);

    if (!targetCol) return;

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: columnId } : l));

    try {
      await fetch('/api/leads/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ pageId: leadId, status: targetCol.notionStatus })
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar lead?")) return;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'arquivado' } : l));
    try { await fetch('/api/leads/archive', { method: 'POST', body: JSON.stringify({ pageId: id }) }); } catch (e) {}
  };

  const handleRestore = async (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'contato' } : l));
    try { await fetch('/api/leads/update', { method: 'POST', body: JSON.stringify({ pageId: id, status: 'Em Contato' }) }); } catch (e) {}
  };

  // --- Filtragem ---
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Arquivado
      const isArchived = lead.status === 'arquivado';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;

      // 2. Score (Maior ou igual ao slider)
      if (lead.leadScore < minScore) return false;

      // 3. Texto
      const matchSearch = lead.nome.toLowerCase().includes(search.toLowerCase()) || 
                          lead.telefone.includes(search);
      // 4. Perfil
      const matchProfile = profileFilter === 'Todos' || 
                           lead.perfil.toLowerCase() === profileFilter.toLowerCase();
      
      // 5. Data
      let matchDate = true;
      if (dateFilter) {
        const leadDate = new Date(lead.createdAt).setHours(0,0,0,0);
        const filterDate = new Date(dateFilter).setHours(0,0,0,0);
        matchDate = leadDate >= filterDate;
      }

      return matchSearch && matchProfile && matchDate;
    });
  }, [leads, showArchived, search, profileFilter, dateFilter, minScore]);

  if (!isMounted) return null;

  return (
    <div className="h-full flex flex-col">
      {/* BARRA DE FILTROS */}
      <div className="mb-6 bg-slate-900/90 backdrop-blur-sm p-4 rounded-xl border border-slate-800 shadow-xl sticky top-0 z-20 flex flex-col xl:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Busca */}
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input 
              className="bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:border-blue-500 w-48"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Perfil */}
          <div className="relative">
            <User className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <select 
              className="bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-sm text-slate-300 focus:border-blue-500 appearance-none cursor-pointer"
              value={profileFilter}
              onChange={e => setProfileFilter(e.target.value)}
            >
              <option value="Todos">Todos Perfis</option>
              <option value="Investidor">Investidor</option>
              <option value="Moradia">Moradia</option>
            </select>
          </div>

          {/* Data */}
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2">
            <Calendar className="text-slate-500 w-4 h-4 mr-2" />
            <input 
              type="date" 
              className="bg-transparent text-sm text-slate-300 focus:outline-none"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>

          {/* Filtro de Score (Slider) */}
          <div className="flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 h-[38px]">
            <BarChart2 className="text-slate-500 w-4 h-4" />
            <div className="flex flex-col w-32">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Min Score</span>
                <span className="text-blue-400 font-bold">{minScore}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botão Arquivados */}
        <button 
          onClick={() => setShowArchived(!showArchived)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
            showArchived 
              ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {showArchived ? <Undo2 size={16} /> : <Archive size={16} />}
          {showArchived ? 'Voltar ao Funil' : 'Arquivados'}
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      {showArchived ? (
        <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-6 overflow-y-auto">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Archive className="text-orange-500" /> Leads Arquivados ({filteredLeads.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all">
                <div>
                  <h4 className="text-white font-medium mb-1">{lead.nome}</h4>
                  <p className="text-slate-500 text-xs mb-3">{lead.telefone}</p>
                  <div className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded inline-block mb-2">Score: {lead.leadScore}</div>
                </div>
                <button 
                  onClick={() => handleRestore(lead.id)}
                  className="w-full py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {COLUMNS.map((col) => (
              <KanbanColumn 
                key={col.id} 
                column={col} 
                leads={filteredLeads.filter(l => l.status === col.id)}
                onDelete={handleArchive}
              />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}