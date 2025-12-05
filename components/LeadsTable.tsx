'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, Filter, ChevronDown, Check, X, MapPin, Wallet, Building2, User } from 'lucide-react';
import { SummaryCell } from './SummaryCell';

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  status: string;
  cidades: string[]; // Agora é uma lista de strings
  interesse: string;
  createdAt: string;
  leadScore: number;
  perfil: string;
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  // --- Estados ---
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [profileFilter, setProfileFilter] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estado para Múltipla Seleção de Cidades
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // --- Lista de Cidades Únicas (Extrai todas as cidades de todos os leads) ---
  const uniqueCities = useMemo(() => {
    // flatMap junta todas as arrays de cidades em uma só lista
    const allCities = initialLeads.flatMap(l => l.cidades);
    // Filtra vazios e duplicatas
    const validCities = allCities.filter(c => c && c !== 'Não informada' && c !== 'Não Identificada');
    return Array.from(new Set(validCities)).sort();
  }, [initialLeads]);

  // Fecha dropdown ao clicar fora
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
    setSelectedCities(prev => 
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  // --- Lógica de Filtragem ---
  const filteredLeads = useMemo(() => {
    return initialLeads.filter(lead => {
      // 1. Texto
      const matchesSearch = lead.nome.toLowerCase().includes(searchName.toLowerCase()) || 
                            lead.telefone.includes(searchName);

      // 2. Status
      const matchesStatus = statusFilter === 'Todos' || 
                            lead.status.toLowerCase() === statusFilter.toLowerCase();

      // 3. Perfil
      const matchesProfile = profileFilter === 'Todos' || lead.perfil === profileFilter;

      // 4. Localização (Verifica se ALGUMA cidade do lead está nos filtros selecionados)
      const matchesLocation = selectedCities.length === 0 || 
                              lead.cidades.some(city => selectedCities.includes(city));

      // 5. Data
      let matchesDate = true;
      if (startDate || endDate) {
        const leadDate = new Date(lead.createdAt).setHours(0,0,0,0);
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
        const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;
        if (start && leadDate < start) matchesDate = false;
        if (end && leadDate > end) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesProfile && matchesLocation && matchesDate;
    });
  }, [initialLeads, searchName, statusFilter, profileFilter, selectedCities, startDate, endDate]);

  const clearFilters = () => {
    setSearchName('');
    setStatusFilter('Todos');
    setProfileFilter('Todos');
    setSelectedCities([]);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden">
      
      {/* --- BARRA DE FILTROS --- */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          
          <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
            {/* Busca */}
            <div className="relative group w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-blue-500 transition-colors h-4 w-4" />
              <input 
                type="text" 
                placeholder="Buscar nome ou telefone..." 
                className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1"></div>

            {/* Filtro Status (Sem Emojis) */}
            <select 
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Status: Todos</option>
              <option value="Quente">Quente</option>
              <option value="Morno">Morno</option>
              <option value="Frio">Frio</option>
              <option value="Novo">Novo</option>
            </select>

            {/* Filtro Perfil (Sem Emojis) */}
            <select 
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]"
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
            >
              <option value="Todos">Perfil: Todos</option>
              <option value="Investidor">Investidor</option>
              <option value="Moradia">Moradia</option>
              <option value="Geral">Geral</option>
            </select>

            {/* Dropdown Multi-Select de Localização */}
            <div className="relative" ref={locationDropdownRef}>
              <button 
                className={`flex items-center justify-between gap-2 bg-slate-900 border ${selectedCities.length > 0 ? 'border-blue-500/50 text-blue-400' : 'border-slate-700 text-slate-300 hover:border-slate-600'} rounded-lg py-2 px-3 text-sm min-w-[160px] transition-all`}
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              >
                <span className="truncate">
                  {selectedCities.length === 0 
                    ? "Todas as cidades" 
                    : `${selectedCities.length} cidade(s)`}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                    {uniqueCities.map(city => (
                      <div 
                        key={city}
                        onClick={() => toggleCity(city)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          selectedCities.includes(city) 
                            ? 'bg-blue-600/20 text-blue-400' 
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selectedCities.includes(city) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'
                        }`}>
                          {selectedCities.includes(city) && <Check size={10} className="text-white" />}
                        </div>
                        <span className="text-sm">{city}</span>
                      </div>
                    ))}
                    {uniqueCities.length === 0 && <p className="text-xs text-slate-500 p-2">Nenhuma cidade disponível.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 w-full xl:w-auto">
              <Calendar size={14} className="text-slate-500" />
              <input 
                type="date" 
                className="bg-transparent focus:outline-none w-full xl:w-auto cursor-pointer"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-600">-</span>
              <input 
                type="date" 
                className="bg-transparent focus:outline-none w-full xl:w-auto cursor-pointer"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button 
              onClick={clearFilters}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-all"
              title="Limpar Filtros"
            >
              <Filter size={18} />
            </button>
          </div>
        </div>
        
        {/* Tags de Filtros Ativos */}
        {selectedCities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800/50">
            <span className="text-xs text-slate-500 py-1">Locais selecionados:</span>
            {selectedCities.map(city => (
              <span key={city} className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs">
                {city}
                <button onClick={() => toggleCity(city)} className="hover:text-white"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* --- TABELA --- */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950/80 text-slate-200 uppercase font-semibold text-[11px] tracking-wider sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Perfil</th>
              <th className="px-6 py-4 w-[200px]">Localizações</th>
              <th className="px-6 py-4 w-1/3">Resumo</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Filter size={24} className="opacity-20" />
                    <p className="text-sm">Nenhum resultado encontrado.</p>
                    <button onClick={clearFilters} className="text-blue-400 hover:text-blue-300 text-xs underline">
                      Limpar filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">{lead.nome}</span>
                      <span className="text-blue-400/80 text-xs font-mono mt-0.5">{lead.telefone}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      lead.perfil === 'Investidor' ? 'bg-purple-950/30 text-purple-300 border-purple-500/20' :
                      lead.perfil === 'Moradia' ? 'bg-orange-950/30 text-orange-300 border-orange-500/20' :
                      'bg-slate-800/50 text-slate-400 border-slate-700'
                    }`}>
                      {lead.perfil === 'Investidor' && <Wallet size={11} />}
                      {lead.perfil === 'Moradia' && <Building2 size={11} />}
                      {lead.perfil === 'Geral' && <User size={11} />}
                      {lead.perfil}
                    </span>
                  </td>

                  {/* Renderiza as cidades como etiquetas separadas */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {lead.cidades.length === 1 && lead.cidades[0] === 'Não informada' ? (
                        <span className="text-slate-600 text-xs">-</span>
                      ) : (
                        lead.cidades.map((city, idx) => (
                          <span key={idx} className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            <MapPin size={10} className="text-pink-500" />
                            {city}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <SummaryCell content={lead.interesse} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex self-start items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                        lead.status.toLowerCase().includes('quente') 
                          ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' 
                          : lead.status.toLowerCase().includes('morno')
                          ? 'bg-yellow-950/30 text-yellow-400 border-yellow-500/20'
                          : 'bg-blue-950/30 text-blue-400 border-blue-500/20'
                      }`}>
                        {lead.status}
                      </span>
                      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            lead.leadScore >= 70 ? 'bg-emerald-500' : 
                            lead.leadScore >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} 
                          style={{ width: `${Math.min(lead.leadScore, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className="text-slate-400 text-xs font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: '2-digit'
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center text-xs text-slate-500">
        <span>Mostrando {filteredLeads.length} resultados</span>
        <span>Total: {initialLeads.length}</span>
      </div>
    </div>
  );
}