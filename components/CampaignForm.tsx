'use client'; // Necessário para usar hooks do React

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export function CampaignForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offer: 'Oportunidade de Pré-Lançamento em Itapema com alta valorização.',
    status: 'morno',
    limit: 10,
    profile: 'Ambos (Geral)'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Conectar com seu n8n aqui
    try {
      const response = await fetch('https://webhook.saveautomatik.shop/webhook/reengajamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oferta_disponivel: formData.offer,
          target_status: formData.status,
          limit: Number(formData.limit),
          target_profile: formData.profile
        })
      });

      if (response.ok) {
        alert('✅ Campanha disparada com sucesso!');
      } else {
        alert('❌ Erro ao conectar com n8n');
      }
    } catch (error) {
      alert('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🚀 Disparador de Campanhas
        </h2>
        <p className="text-slate-400 text-sm">Configure o disparo em massa via IA.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Oferta */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Contexto da Oferta</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
            value={formData.offer}
            onChange={(e) => setFormData({...formData, offer: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status do Lead</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="quente">Quente 🔥</option>
              <option value="morno">Morno 😐</option>
              <option value="frio">Frio ❄️</option>
            </select>
          </div>

          {/* Perfil */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Perfil Alvo</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.profile}
              onChange={(e) => setFormData({...formData, profile: e.target.value})}
            >
              <option value="Ambos (Geral)">Ambos (Geral)</option>
              <option value="Apenas Investidores">Apenas Investidores</option>
              <option value="Apenas Moradia">Apenas Moradia</option>
            </select>
          </div>

          {/* Limite */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Limite de Envios</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.limit}
              onChange={(e) => setFormData({...formData, limit: Number(e.target.value)})}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          {loading ? 'Enviando comando...' : 'Disparar Campanha Agora'}
        </button>
      </form>
    </div>
  );
}