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
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    const leads = response.results.map((page: any) => {
      const props = page.properties;

      const telefone = props.Telefone?.title?.[0]?.plain_text || 'Sem Telefone';
      const nome = props.Nome?.rich_text?.[0]?.plain_text || 'Sem Nome';
      const resumo = props.Resumo?.rich_text?.[0]?.plain_text || 'Sem interesse registrado';
      const dataCriacao = props.Data?.date?.start || page.created_time;

      // --- CORREÇÃO: Tratamento de Localização Múltipla ---
      const locProp = props['Localização De Interesse'] || 
                      props['Localização de Interesse'] || 
                      props['Localização'];
      
      let cidades: string[] = [];

      if (locProp) {
        if (locProp.type === 'multi_select') {
          // Se for Multi-Select no Notion, pega todas as tags
          cidades = locProp.multi_select.map((opt: any) => opt.name);
        } else if (locProp.type === 'select') {
          // Se for Select simples
          if (locProp.select?.name) cidades.push(locProp.select.name);
        } else if (locProp.type === 'rich_text') {
          // Se for Texto, quebra nas vírgulas (ex: "Itapema, Porto Belo")
          const text = locProp.rich_text[0]?.plain_text || '';
          if (text) {
            cidades = text.split(',').map((c: string) => c.trim()).filter((c: string) => c !== '');
          }
        }
      }

      if (cidades.length === 0) cidades = ['Não informada'];

      // --- Status e Score ---
      const statusRaw = props.Leadscore?.rich_text?.[0]?.plain_text || 
                        props.Leadscore?.select?.name || 
                        'Novo';

      let scoreNum = 0;
      const statusLower = statusRaw.toLowerCase();
      if (statusLower.includes('quente')) scoreNum = 90;
      else if (statusLower.includes('morno')) scoreNum = 50;
      else if (statusLower.includes('frio')) scoreNum = 20;

      // --- Perfil ---
      const resumoLower = resumo.toLowerCase();
      let perfil = 'Geral';
      if (resumoLower.includes('investimento') || resumoLower.includes('investidor')) {
        perfil = 'Investidor';
      } else if (resumoLower.includes('moradia') || resumoLower.includes('morar')) {
        perfil = 'Moradia';
      }

      return {
        id: page.id,
        nome: nome,
        telefone: telefone,
        status: statusRaw,
        cidades: cidades, // Agora é um ARRAY (Lista)
        interesse: resumo,
        createdAt: dataCriacao,
        leadScore: scoreNum,
        perfil: perfil,
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO NO NOTION:", error.message);
    return [];
  }
}