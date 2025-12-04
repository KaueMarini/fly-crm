import { Client } from '@notionhq/client';

// 1. Verificação das variáveis de ambiente
if (!process.env.NOTION_KEY) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_KEY não foi encontrada no arquivo .env.local");
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_DATABASE_ID não foi encontrada no arquivo .env.local");
}

// 2. Inicialização do Cliente (Isso estava faltando)
const notion = new Client({
  auth: process.env.NOTION_KEY,
});

export async function getLeads() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;

    // A: Busca o ID da Fonte de Dados (necessário na nova API)
    const database = await notion.databases.retrieve({ database_id: databaseId });
    
    // O TypeScript pode não reconhecer 'data_sources' ainda se os tipos estiverem desatualizados,
    // então usamos 'as any' aqui apenas para acessar essa propriedade nova.
    const dataSources = (database as any).data_sources;
    
    if (!dataSources || dataSources.length === 0) {
      throw new Error("Nenhuma fonte de dados (Data Source) encontrada neste Banco de Dados.");
    }
    
    const dataSourceId = dataSources[0].id;

    // B: Faz a consulta usando dataSources.query
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    // C: Mapeamento dos dados (baseado no seu print)
    const leads = response.results.map((page: any) => {
      const props = page.properties;

      // Telefone é o Título (Aa)
      const telefone = props.Telefone?.title?.[0]?.plain_text || 'Sem Telefone';

      // Nome é Texto (Rich Text)
      const nome = props.Nome?.rich_text?.[0]?.plain_text || 'Sem Nome';

      // Status vem da coluna "Leadscore" que parece ser texto/select no seu print
      const statusRaw = props.Leadscore?.rich_text?.[0]?.plain_text || 
                        props.Leadscore?.select?.name || 
                        'Novo';

      // Define pontuação baseada no texto do status
      let scoreNum = 0;
      const statusLower = statusRaw.toLowerCase();
      if (statusLower.includes('quente')) scoreNum = 90;
      else if (statusLower.includes('morno')) scoreNum = 50;
      else if (statusLower.includes('frio')) scoreNum = 20;

      return {
        id: page.id,
        nome: nome,
        telefone: telefone,
        status: statusRaw,
        cidade: "Não informada", // Sua tabela não tem essa coluna
        leadScore: scoreNum,
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO NO NOTION:", error.message);
    return [];
  }
}