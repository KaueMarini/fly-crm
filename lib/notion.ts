import { Client } from '@notionhq/client';

// Verifica se as chaves existem antes de tentar conectar
if (!process.env.NOTION_KEY) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_KEY não foi encontrada no arquivo .env.local");
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_DATABASE_ID não foi encontrada no arquivo .env.local");
}

// Inicializa o cliente (sem 'as any' para o TypeScript validar)
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

export async function getLeads() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;

    const response = await (notion.databases as any).query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    // Mapeia os dados (protegendo contra campos vazios)
    const leads = response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        nome: props.Nome?.title?.[0]?.plain_text || 'Sem Nome',
        telefone: props.Telefone?.rich_text?.[0]?.plain_text || 
                  props.Telefone?.phone_number || 'Sem Telefone',
        status: props.Status?.select?.name || 
                props.Status?.rich_text?.[0]?.plain_text || 'Novo',
        cidade: props.Cidade?.select?.name || 
                props.Cidade?.rich_text?.[0]?.plain_text || 'Não informada',
        leadScore: props.LeadScore?.number || props['Lead Score']?.number || 0,
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR NO NOTION:", error.message);
    return []; // Retorna lista vazia para a página não quebrar
  }
}