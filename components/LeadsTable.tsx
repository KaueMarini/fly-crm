'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, Filter, ChevronDown, Check, X, MapPin, Wallet, Building2, User, BarChart2 } from 'lucide-react';
import { SummaryCell } from './SummaryCell';

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  cidades: string[];
  interesse: string;
  createdAt: string;
  leadScore: number;
  perfil: string;
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [profileFilter, setProfileFilter] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minScore, setMinScore] = useState(0); // Novo Estado Score
  
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  const uniqueCities = useMemo(() => {
    const allCities = initialLeads.flatMap(l => l.cidades);
    const validCities = allCities.filter(c => c && c !== 'Não informada' && c !== 'Não Identificada');
    return Array.from(new Set(validCities)).sort();
  }, [initialLeads]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const filteredLeads = useMemo(() => {
    return initialLeads.filter(lead => {
      const matchesSearch = lead.nome.toLowerCase().includes(searchName.toLowerCase()) || 
                            lead.telefone.includes(searchName);
      const matchesStatus = statusFilter === 'Todos' || lead.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesProfile = profileFilter === 'Todos' || lead.perfil.toLowerCase() === profileFilter.toLowerCase();
      const matchesLocation = selectedCities.length === 0 || lead.cidades.some(city => selectedCities.includes(city));
      const matchesScore = lead.leadScore >= minScore; // Filtro de Score

      let matchesDate = true;
      if (startDate || endDate) {
        const leadDate = new Date(lead.createdAt).setHours(0,0,0,0);
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
        const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;
        if (start && leadDate < start) matchesDate = false;
        if (end && leadDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesProfile && matchesLocation && matchesDate && matchesScore;
    });
  }, [initialLeads, searchName, statusFilter, profileFilter, selectedCities, startDate, endDate, minScore]);

  const clearFilters = () => {
    setSearchName('');
    setStatusFilter('Todos');
    setProfileFilter('Todos');
    setSelectedCities([]);
    setStartDate('');
    setEndDate('');
    setMinScore(0);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
      
      {/* BARRA DE FILTROS */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          
          <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            {/* Busca */}
            <div className="relative group w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 text-slate-500 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Nome ou telefone..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1"></div>

            {/* Perfil */}
            <select 
              className="bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 min-w-[120px]"
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
            >
              <option value="Todos">Perfil: Todos</option>
              <option value="Investidor">Investidor</option>
              <option value="Moradia">Moradia</option>
            </select>

            {/* Cidades */}
            <div className="relative" ref={locationDropdownRef}>
              <button 
                className={`flex items-center justify-between gap-2 bg-slate-900 border ${selectedCities.length > 0 ? 'border-blue-500/50 text-blue-400' : 'border-slate-700 text-slate-300'} rounded-lg py-2 px-3 text-sm min-w-[160px]`}
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              >
                <span className="truncate">{selectedCities.length === 0 ? "Cidades" : `${selectedCities.length} selecionada(s)`}</span>
                <ChevronDown size={14} />
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                  {uniqueCities.map(city => (
                    <div key={city} onClick={() => toggleCity(city)} className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${selectedCities.includes(city) ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-slate-300'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCities.includes(city) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                        {selectedCities.includes(city) && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-sm">{city}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slider de Score */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 h-[38px] min-w-[140px]">
              <BarChart2 className="text-slate-500 w-4 h-4" />
              <div className="flex flex-col w-24">
                <div className="flex justify-between text-[9px] text-slate-400">
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

          {/* Data e Limpar */}
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300">
              <Calendar size={14} className="text-slate-500" />
              <input type="date" className="bg-transparent focus:outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>-</span>
              <input type="date" className="bg-transparent focus:outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button onClick={clearFilters} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><Filter size={18} /></button>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/80 text-slate-200 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4 w-[200px]">Cidades</th>
              <th className="px-6 py-4 w-1/3">Resumo</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">{lead.nome}</span>
                    <span className="text-blue-400/80 text-xs font-mono mt-0.5">{lead.telefone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-800/50 text-slate-300 border-slate-700`}>
                    {lead.perfil}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {lead.cidades.map((city, idx) => (
                      <span key={idx} className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                        <MapPin size={10} className="text-pink-500" /> {city}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4"><SummaryCell content={lead.interesse} /></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-white">{lead.leadScore}</span>
                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${lead.leadScore >= 70 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(lead.leadScore, 100)}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-slate-400 text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}