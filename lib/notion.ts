import { Client } from '@notionhq/client';

if (!process.env.NOTION_KEY) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_KEY não foi encontrada no arquivo .env.local");
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("🚨 ERRO CRÍTICO: A variável NOTION_DATABASE_ID não foi encontrada no arquivo .env.local");
}

const notion = new Client({
  auth: process.env.NOTION_KEY,
});

export async function getLeads() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;

    const database = await notion.databases.retrieve({ database_id: databaseId });
    const dataSources = (database as any).data_sources;
    
    if (!dataSources || dataSources.length === 0) {
      throw new Error("Nenhuma fonte de dados encontrada.");
    }
    const dataSourceId = dataSources[0].id;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    const leads = response.results.map((page: any) => {
      const props = page.properties;

      // Mapeamento baseado no seu print do Notion
      const telefone = props.Telefone?.title?.[0]?.plain_text || 'Sem Telefone';
      const nome = props.Nome?.rich_text?.[0]?.plain_text || 'Sem Nome';
      
      // Captura o Resumo (para tabela de últimos ativos)
      const resumo = props.Resumo?.rich_text?.[0]?.plain_text || 'Sem interesse registrado';

      // Captura Data: Tenta a coluna 'Data' do Notion, senão usa a data de criação do sistema
      const dataCriacao = props.Data?.date?.start || page.created_time;

      const statusRaw = props.Leadscore?.rich_text?.[0]?.plain_text || 
                        props.Leadscore?.select?.name || 
                        'Novo';

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
        cidade: "Não informada",
        interesse: resumo,
        createdAt: dataCriacao,
        leadScore: scoreNum,
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO NO NOTION:", error.message);
    return [];
  }
}