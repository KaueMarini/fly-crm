'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Paperclip, CheckCheck, Loader2, Video, Phone, MoreVertical } from 'lucide-react';

// Configure suas URLs de Webhook do n8n aqui
// ATENÇÃO: Use a URL de PRODUÇÃO (a que não tem /test/)
const N8N_WEBHOOK_CONTACTS = 'https://webhook.saveautomatik.shop/webhook/contatosCrm';
const N8N_WEBHOOK_MESSAGES = 'https://webhook.saveautomatik.shop/webhook/MensagemCrm';
const N8N_WEBHOOK_SEND = 'https://webhook.saveautomatik.shop/webhook/chat/enviar';

export function ChatInterface() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Carrega Contatos (Executa apenas uma vez)
  useEffect(() => {
    let isMounted = true; // Para evitar atualizações após o componente ser desmontado

    async function loadContacts() {
      try {
        const res = await fetch(N8N_WEBHOOK_CONTACTS);
        
        if (!res.ok) {
            console.error(`❌ Erro N8N (${res.status}) ao buscar contatos:`, res.statusText);
            throw new Error(`Falha ao carregar contatos (${res.status})`);
        }
        
        const data = await res.json();
        
        if (isMounted) {
            // Garante que é um array e filtra itens inválidos
            const lista = Array.isArray(data) ? data : (data.data || []);
            const contatosValidos = lista.filter((c: any) => c && c.id);
            
            setContacts(contatosValidos);
            
            // Seleciona o primeiro contato se não houver nenhum ativo
            if(contatosValidos.length > 0 && !activeContact) {
                setActiveContact(contatosValidos[0]);
            }
        }
      } catch (e) {
        console.warn("⚠️ Não foi possível conectar ao n8n. Verifique CORS e se o fluxo está Ativo.");
      }
    }
    loadContacts();

    return () => { isMounted = false; };
  }, []);

  // 2. Carrega Mensagens (com Polling, executa ao mudar o contato)
  useEffect(() => {
    if (!activeContact?.id) return;
    
    let isMounted = true;

    async function loadMessages() {
      // Mostra o loader apenas se for a primeira carga ou se não houver mensagens
      if (messages.length === 0) setLoading(true); 
      
      try {
        const res = await fetch(`${N8N_WEBHOOK_MESSAGES}?phone=${activeContact.id}`);
        if (!res.ok) throw new Error(`Erro N8N: ${res.status}`);
        
        const data = await res.json();
        
        if (isMounted) {
            const lista = Array.isArray(data) ? data : (data.data || []);
            setMessages(lista);
        }
      } catch (e) {
        console.error("❌ Falha ao carregar mensagens:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMessages();
    
    // Polling: Atualiza a cada 5 segundos
    const interval = setInterval(loadMessages, 5000);
    
    return () => {
        clearInterval(interval);
        isMounted = false;
    };
  }, [activeContact]);

  // 3. Enviar Mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeContact) return;
    const text = newMessage;
    setNewMessage('');

    // Adiciona na tela imediatamente (Otimista)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
      status: 'sent'
    }]);

    try {
        await fetch(N8N_WEBHOOK_SEND, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: activeContact.id,
                message: text
            })
        });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        alert('Erro ao enviar. Verifique o console.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* --- LISTA LATERAL --- */}
      <div className="w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col">
        <div className="p-4 border-b border-slate-800">
           <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
             <input className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500" placeholder="Buscar conversa..." />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {contacts.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                    {loading ? "Carregando..." : "Nenhum contato."}
                </div>
            ) : (
                contacts.map(contact => (
                    <div 
                        key={contact.id} 
                        onClick={() => setActiveContact(contact)}
                        className={`p-4 flex gap-3 cursor-pointer border-b border-slate-800/50 transition-colors ${
                          activeContact?.id === contact.id ? 'bg-slate-800/80 border-l-4 border-l-blue-500' : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'
                        }`}
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                            {contact.name ? contact.name.charAt(0).toUpperCase() : '#'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-200 font-medium truncate">{contact.name}</span>
                                <span className="text-slate-500 text-[10px]">{contact.time}</span>
                            </div>
                            <p className="text-slate-400 text-xs truncate">{contact.lastMessage}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* --- ÁREA DE CHAT --- */}
      <div className="flex-1 flex flex-col bg-slate-900 relative">
        {/* Background Decorativo */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
        </div>

        {activeContact ? (
            <>
                {/* Header do Chat Ativo */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold">
                            {activeContact.name ? activeContact.name.charAt(0).toUpperCase() : '#'}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{activeContact.name}</h3>
                          <span className="text-xs text-emerald-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                          </span>
                        </div>
                    </div>
                    <div className="flex gap-4 text-slate-400">
                      <Phone size={20} className="hover:text-white cursor-pointer" />
                      <Video size={20} className="hover:text-white cursor-pointer" />
                      <MoreVertical size={20} className="hover:text-white cursor-pointer" />
                    </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 custom-scrollbar">
                    {loading && messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <Loader2 className="animate-spin mb-2" size={32}/>
                          <p className="text-sm">Carregando histórico...</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
                                  msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                                }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                                      <span className="text-[10px]">{msg.timestamp}</span>
                                      {msg.sender === 'me' && <CheckCheck size={12} />}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800 bg-slate-900 z-10">
                    <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-xl p-2 pr-2">
                        <button className="p-2 text-slate-400 hover:text-white transition-colors"><Paperclip size={20} /></button>
                        <input 
                            className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none px-2"
                            placeholder="Digite sua mensagem..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg text-white transition-all shadow-lg hover:scale-105 active:scale-95">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
                <p>Selecione uma conversa para começar</p>
            </div>
        )}
      </div>
    </div>
  );
}