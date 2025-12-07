'use client';

import { useState } from 'react';
import { MapPin, Wallet, Home, ArrowRight, Star, Sparkles, Phone, CheckCircle2 } from 'lucide-react';

// Simulando sua carteira de imóveis (Isso viria do Notion/Banco no futuro)
const OPPORTUNITIES = [
  {
    id: 1,
    title: "Edifício Horizon View",
    city: "Itapema",
    type: "Investidor",
    price: "R$ 850.000",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
    tags: ["Lançamento", "Frente Mar"]
  },
  {
    id: 2,
    title: "Residencial Green Valley",
    city: "Florianópolis",
    type: "Moradia",
    price: "R$ 1.200.000",
    image: "https://images.unsplash.com/photo-1600596542815-60c37c6525fa?auto=format&fit=crop&w=400&q=80",
    tags: ["Pronto para Morar", "Alto Padrão"]
  },
  {
    id: 3,
    title: "Ocean Breeze Tower",
    city: "Balneário Camboriú",
    type: "Investidor",
    price: "R$ 2.500.000",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
    tags: ["Luxo", "Alta Rentabilidade"]
  }
];

export function SmartMatch({ leads }: { leads: any[] }) {
  const [selectedProp, setSelectedProp] = useState(OPPORTUNITIES[0]);

  // Lógica de Match (IA Simples)
  const getMatches = (property: any) => {
    return leads
      .map(lead => {
        let score = 0;
        const reasons = [];

        // 1. Match de Cidade (Peso Alto)
        // Verifica se a cidade do imóvel está na lista de interesses do lead
        const cityMatch = lead.cidades.some((c: string) => 
          c.toLowerCase().includes(property.city.toLowerCase())
        );
        if (cityMatch) {
          score += 40;
          reasons.push("Localização Exata");
        }

        // 2. Match de Perfil (Peso Médio)
        if (lead.perfil === property.type || lead.perfil === 'Geral') {
          score += 30;
          reasons.push(`Perfil ${property.type}`);
        }

        // 3. Temperatura do Lead (Peso Baixo - Desempate)
        if (lead.leadScore > 60) score += 20;
        if (lead.leadScore > 80) score += 10;

        return { ...lead, matchScore: score, reasons };
      })
      .filter(l => l.matchScore > 30) // Só mostra quem tem potencial
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = getMatches(selectedProp);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      
      {/* COLUNA ESQUERDA: LISTA DE IMÓVEIS (CARTEIRA) */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <Home size={14} /> Carteira em Destaque
        </h3>
        
        {OPPORTUNITIES.map((prop) => (
          <div 
            key={prop.id}
            onClick={() => setSelectedProp(prop)}
            className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden ${
              selectedProp.id === prop.id 
                ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)]' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-sm ${selectedProp.id === prop.id ? 'text-blue-400' : 'text-white'}`}>
                    {prop.title}
                  </h4>
                  {selectedProp.id === prop.id && <Sparkles size={14} className="text-blue-400 animate-pulse" />}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                  <MapPin size={10} /> {prop.city}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-emerald-400 font-bold text-sm">{prop.price}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 bg-slate-900">
                    {prop.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center text-slate-500 hover:text-slate-400 hover:border-slate-700 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
            <span className="text-xl">+</span>
          </div>
          <span className="text-sm font-medium">Cadastrar Novo Imóvel</span>
        </div>
      </div>

      {/* COLUNA DIREITA: MATCHMAKER (RESULTADOS) */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-2xl">
        
        {/* Background FX */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        {/* Header do Imóvel Selecionado */}
        <div className="relative z-10 border-b border-slate-800 pb-6 mb-6 flex justify-between items-end">
          <div>
            <span className="text-blue-500 text-xs font-bold tracking-widest uppercase mb-2 block">Oportunidade Selecionada</span>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedProp.title}</h2>
            <div className="flex gap-3">
              {selectedProp.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Leads compatíveis encontrados</p>
            <p className="text-4xl font-bold text-white">{matches.length}</p>
          </div>
        </div>

        {/* Lista de Matches */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10 pr-2">
          {matches.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <SearchX size={48} className="mb-4" />
              <p>Nenhum lead compatível encontrado para este perfil.</p>
            </div>
          ) : (
            matches.map((lead, idx) => (
              <div 
                key={lead.id} 
                className="bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 p-4 rounded-xl flex items-center justify-between group transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Match Score Circle */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path 
                        className={lead.matchScore >= 80 ? "text-emerald-500" : lead.matchScore >= 50 ? "text-blue-500" : "text-yellow-500"} 
                        strokeDasharray={`${lead.matchScore}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{lead.matchScore}%</span>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-sm flex items-center gap-2">
                      {lead.nome}
                      {lead.matchScore >= 80 && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                    </h4>
                    <div className="flex gap-2 mt-1">
                      {lead.reasons.map((r: string) => (
                        <span key={r} className="text-[10px] px-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                  <button 
                    className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="Ligar Agora"
                  >
                    <Phone size={16} />
                  </button>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Ofertar Agora <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SearchX(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  )
}