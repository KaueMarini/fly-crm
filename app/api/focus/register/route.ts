import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_KEY });
const FOCUS_DB_ID = process.env.NOTION_FOCUS_DB_ID;

export async function POST(request: Request) {
  try {
    const { leadId, action, leadName } = await request.json();
    
    // --- PASSO 1: Atualizar o Status do Lead (Crítico para a funcionalidade) ---
    // Isso faz o lead sair da tela do Modo Foco
    let novoStatusFoco = "Pendente";
    if (action === 'discard') novoStatusFoco = "Descartado";
    if (action === 'postpone') novoStatusFoco = "Adiado";

    try {
      await notion.pages.update({
        page_id: leadId,
        properties: {
          "Status Foco": { select: { name: novoStatusFoco } }
        }
      });
    } catch (e: any) {
      console.error("❌ Erro ao atualizar 'Status Foco' no lead:", e.body || e.message);
      return NextResponse.json({ 
        error: "Verifique se a propriedade 'Status Foco' (Select) existe no banco de Leads." 
      }, { status: 400 });
    }

    // --- PASSO 2: Criar o Log de Histórico (Opcional) ---
    // Envolvemos em um try/catch isolado para não travar o app se a tabela de logs estiver errada
    if (FOCUS_DB_ID) {
      try {
        await notion.pages.create({
          parent: { database_id: FOCUS_DB_ID },
          properties: {
            "Nome": { title: [{ text: { content: `Interação com ${leadName || 'Lead'}` } }] },
            // ATENÇÃO: A coluna no Notion deve se chamar exatamente "Lead"
            "Lead": { relation: [{ id: leadId }] }, 
            "Ação": { select: { name: action === 'discard' ? 'Descartado' : action === 'postpone' ? 'Adiado' : 'Contactado' } },
            "Data": { date: { start: new Date().toISOString() } }
          }
        });
      } catch (logError: any) {
        // Apenas avisamos no console do servidor, mas retornamos sucesso para o frontend
        console.warn("⚠️ Aviso: Log não criado. Verifique se as colunas 'Lead', 'Ação' e 'Data' existem no banco Focus Session Logs.");
        console.warn("Erro detalhado:", logError.body?.message || logError.message);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro geral na API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}