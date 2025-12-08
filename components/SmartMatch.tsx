'use client';

import { useState } from 'react';
import { MapPin, Home, ArrowRight, Star, Sparkles, Phone, Plus, X, Image as ImageIcon, DollarSign, Tag } from 'lucide-react';

// Dados iniciais (Demo)
const INITIAL_OPPORTUNITIES = [
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
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [selectedProp, setSelectedProp] = useState(INITIAL_OPPORTUNITIES[0]);
  
  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProp, setNewProp] = useState({
    title: '',
    city: '',
    type: 'Investidor',
    price: '',
    image: '',
    tags: ''
  });

  // --- Lógica de Match ---
  const getMatches = (property: any) => {
    return leads
      .map(lead => {
        let score = 0;
        const reasons: string[] = [];

        // 1. Cidade (Peso 40)
        const cityMatch = lead.cidades.some((c: string) => 
          c.toLowerCase().includes(property.city.toLowerCase()) || 
          property.city.toLowerCase().includes(c.toLowerCase())
        );
        if (cityMatch) {
          score += 40;
          reasons.push("📍 Localização Exata");
        }

        // 2. Perfil (Peso 30)
        if (lead.perfil === property.type || lead.perfil === 'Geral') {
          score += 30;
          reasons.push(`🎯 Perfil ${property.type}`);
        }

        // 3. Temperatura (Peso 20/10)
        if (lead.leadScore > 60) score += 20;
        if (lead.leadScore > 80) score += 10;

        return { ...lead, matchScore: score, reasons };
      })
      .filter(l => l.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = getMatches(selectedProp);

  // --- Função: Adicionar Imóvel ---
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now();
    const propertyToAdd = {
      ...newProp,
      id,
      tags: newProp.tags.split(',').map(t => t.trim()), // Converte string "tag1, tag2" em array
      // Imagem padrão se vazia
      image: newProp.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80" 
    };

    setOpportunities([propertyToAdd, ...opportunities]);
    setSelectedProp(propertyToAdd); // Seleciona o novo imóvel
    setIsModalOpen(false); // Fecha modal
    // Limpa form
    setNewProp({ title: '', city: '', type: 'Investidor', price: '', image: '', tags: '' });
  };

  // --- Função: Abrir WhatsApp ---
  const handleOffer = (lead: any) => {
    // 1. Limpa o telefone (deixa apenas números)
    const rawPhone = lead.telefone.replace(/\D/g, '');
    
    // Adiciona 55 se não tiver (assumindo Brasil)
    const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

    // 2. Cria mensagem personalizada
    const firstName = lead.nome.split(' ')[0];
    const message = `Olá ${firstName}! 👋\n\nEncontrei uma oportunidade que combina muito com o seu perfil de *${lead.perfil}*:\n\n🏢 *${selectedProp.title}* em ${selectedProp.city}\n💰 ${selectedProp.price}\n\nAcredito que faz sentido pelo seu interesse em ${selectedProp.city}. Podemos agendar uma visita?`;

    // 3. Abre API do Whats
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] relative">
      
      {/* --- COLUNA ESQUERDA: CARTEIRA --- */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Home size={14} /> Carteira
          </h3>
        </div>
        
        {/* Botão Adicionar (Topo) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group mb-2"
        >
          <div className="bg-slate-800 group-hover:bg-blue-500/20 p-1 rounded-full transition-colors">
            <Plus size={16} />
          </div>
          <span className="text-sm font-medium">Novo Imóvel</span>
        </button>

        {opportunities.map((prop) => (
          <div 
            key={prop.id}
            onClick={() => setSelectedProp(prop)}
            className={`group cursor-pointer rounded-2xl border p-3 transition-all duration-300 relative overflow-hidden ${
              selectedProp.id === prop.id 
                ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]' 
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold text-sm truncate ${selectedProp.id === prop.id ? 'text-blue-400' : 'text-white'}`}>
                    {prop.title}
                  </h4>
                  {selectedProp.id === prop.id && <Sparkles size={12} className="text-blue-400 animate-pulse shrink-0 ml-1" />}
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-1">
                  <MapPin size={10} /> {prop.city}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-emerald-400 font-bold text-xs">{prop.price}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-slate-700 text-slate-500 bg-slate-950">
                    {prop.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- COLUNA DIREITA: MATCHMAKER --- */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden flex flex-col shadow-2xl">
        {/* Glow de Fundo */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        {/* Header do Imóvel Selecionado */}
        <div className="relative z-10 border-b border-slate-800 pb-6 mb-6 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-500 text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Oportunidade Ativa
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedProp.title}</h2>
            <div className="flex gap-2">
              {selectedProp.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Compradores Potenciais</p>
            <p className="text-5xl font-bold text-white flex items-center justify-end gap-2">
              {matches.length} <span className="text-lg text-slate-500 font-normal">leads</span>
            </p>
          </div>
        </div>

        {/* Lista de Matches */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10 pr-2">
          {matches.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-70">
              <div className="p-4 rounded-full bg-slate-800/50 border border-slate-800">
                <SearchX size={32} />
              </div>
              <p className="text-sm">Nenhum match perfeito encontrado para este perfil.</p>
            </div>
          ) : (
            matches.map((lead, idx) => (
              <div 
                key={lead.id} 
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/30 p-4 rounded-xl flex items-center justify-between group transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-5">
                  {/* Score Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path 
                        className={lead.matchScore >= 80 ? "text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]" : lead.matchScore >= 50 ? "text-blue-500" : "text-yellow-500"} 
                        strokeDasharray={`${lead.matchScore}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{lead.matchScore}%</span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-sm flex items-center gap-2 truncate">
                      {lead.nome}
                      {lead.matchScore >= 80 && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {lead.reasons.map((r: string) => (
                        <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/20 text-blue-300 border border-blue-500/10">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-4">
                  {/* Botão Whats */}
                  <button 
                    onClick={() => handleOffer(lead)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95"
                  >
                    Ofertar Agora <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL: ADICIONAR IMÓVEL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Plus size={18} className="text-blue-500" /> Novo Imóvel
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProperty} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Título do Anúncio</label>
                  <div className="relative">
                    <Home size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      required
                      placeholder="Ex: Edifício Ocean View"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                      value={newProp.title}
                      onChange={e => setNewProp({...newProp, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Cidade</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input 
                        required
                        placeholder="Ex: Itapema"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                        value={newProp.city}
                        onChange={e => setNewProp({...newProp, city: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Valor (R$)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input 
                        required
                        placeholder="Ex: 850.000"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                        value={newProp.price}
                        onChange={e => setNewProp({...newProp, price: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Perfil Ideal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewProp({...newProp, type: 'Investidor'})}
                      className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${newProp.type === 'Investidor' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                      Investidor 💰
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewProp({...newProp, type: 'Moradia'})}
                      className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${newProp.type === 'Moradia' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                      Moradia 🏠
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">URL da Imagem (Opcional)</label>
                  <div className="relative">
                    <ImageIcon size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                      value={newProp.image}
                      onChange={e => setNewProp({...newProp, image: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase font-bold mb-1.5 block">Tags (separadas por vírgula)</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                      placeholder="Ex: Frente Mar, Mobiliado, Lançamento"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                      value={newProp.tags}
                      onChange={e => setNewProp({...newProp, tags: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                  Salvar Imóvel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function SearchX(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  )
}