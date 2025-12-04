import { Client } from '@notionhq/client';

// Inicializa o cliente do Notion
const notion = new Client({ auth: process.env.NOTION_KEY }) as any;

export async function getLeads() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error("❌ ID do Banco de Dados não encontrado no .env.local");
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: 'created_time', // Ordena pelos mais recentes
          direction: 'descending',
        },
      ],
    });

    // Mapeia e limpa os dados para um formato simples
    const leads = response.results.map((page: any) => {
      const props = page.properties;

      return {
        id: page.id,
        // ⚠️ IMPORTANTE: Os nomes aqui ('Nome', 'Telefone', etc) devem ser IDÊNTICOS
        // aos nomes das colunas lá no seu Notion (Maiúsculas/Minúsculas importam).
        
        // 1. Nome (Geralmente é do tipo Title)
        nome: props.Nome?.title?.[0]?.plain_text || 'Sem Nome',
        
        // 2. Telefone (Pode ser Texto ou Phone)
        telefone: props.Telefone?.rich_text?.[0]?.plain_text || 
                  props.Telefone?.phone_number || 
                  'Sem Telefone',
        
        // 3. Status (Select ou Texto)
        status: props.Status?.select?.name || 
                props.Status?.rich_text?.[0]?.plain_text || 
                'Novo',
        
        // 4. Cidade (Select ou Texto)
        cidade: props.Cidade?.select?.name || 
                props.Cidade?.rich_text?.[0]?.plain_text || 
                'Não informada',
        
        // 5. Lead Score (Number)
        leadScore: props.LeadScore?.number || props['Lead Score']?.number || 0,
      };
    });

    return leads;

  } catch (error) {
    console.error("❌ Erro ao buscar dados do Notion:", error);
    return []; // Retorna lista vazia para não quebrar o site
  }
}