import { Client } from '@notionhq/client';
import { Lead } from '@/types/kanban';

if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY");
if (!process.env.NOTION_DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID");

const notion = new Client({ auth: process.env.NOTION_KEY });

// --- 1. Busca os FUNIS (Opções da propriedade 'Funil') ---
export async function getPipelines() {
  const databaseId = process.env.NOTION_DATABASE_ID as string;
  const response = await notion.databases.retrieve({ database_id: databaseId });
  const db = response as any; // Cast as any para evitar erro de tipo

  const funilProp = db.properties?.['Funil'];
  if (!funilProp || funilProp.type !== 'select') return [{ id: 'Vendas', title: 'Vendas (Padrão)', stages: [] }];

  return funilProp.select.options.map((opt: any) => ({
      id: opt.name,
      title: opt.name,
      stages: [] // As colunas serão preenchidas depois
  }));
}

// --- 2. Busca as ETAPAS (Opções da propriedade 'Status') ---
export async function getPipelineStages() {
  const databaseId = process.env.NOTION_DATABASE_ID as string;
  const response = await notion.databases.retrieve({ database_id: databaseId });
  const db = response as any;
  
  const statusProp = db.properties?.['Status'];
  if (!statusProp || statusProp.type !== 'select') return [];

  return statusProp.select.options.map((opt: any) => ({
      id: opt.name,
      title: opt.name,
      color: mapColor(opt.color)
  }));
}

// --- 3. Busca os Leads ---
export async function getLeads(): Promise<Lead[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;
    
    // Tenta usar Data Source ou Fallback
    let response;
    const dbResponse = await notion.databases.retrieve({ database_id: databaseId });
    const database = dbResponse as any;

    if (database.data_sources && database.data_sources.length > 0) {
        response = await notion.dataSources.query({
            data_source_id: database.data_sources[0].id,
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        });
    } else {
        response = await (notion.databases as any).query({
            database_id: databaseId,
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        });
    }

    return response.results.map((page: any) => {
      const props = page.properties;

      const nome = props.Nome?.title?.[0]?.plain_text || 'Sem Nome';
      const telefone = props.Telefone?.rich_text?.[0]?.plain_text || 'Sem Telefone';
      const status = props.Status?.select?.name || 'Novo Lead';
      const funil = props.Funil?.select?.name || 'Vendas'; 
      
      const scoreTag = props.Leadscore?.select?.name || 'Frio';
      let scoreNum = 20;
      if (scoreTag.toLowerCase().includes('quente')) scoreNum = 90;
      else if (scoreTag.toLowerCase().includes('morno')) scoreNum = 50;

      // Cidades
      const locProp = props['Localização De Interesse'] || props['Localização'];
      let cidade = 'Não informada';
      if (locProp?.rich_text?.[0]?.plain_text) cidade = locProp.rich_text[0].plain_text;

      return {
        id: page.id,
        nome, telefone, status, funil,
        leadScoreTag: scoreTag, leadScore: scoreNum,
        cidade, interesse: '', createdAt: page.created_time,
      };
    });
  } catch (error: any) {
    console.error("Erro Notion:", error);
    return [];
  }
}

function mapColor(notionColor: string) {
    const colors: Record<string, string> = {
        'default': 'bg-slate-500', 'gray': 'bg-slate-500', 'brown': 'bg-orange-800',
        'orange': 'bg-orange-500', 'yellow': 'bg-yellow-500', 'green': 'bg-emerald-500',
        'blue': 'bg-blue-500', 'purple': 'bg-purple-500', 'pink': 'bg-pink-500', 'red': 'bg-red-500',
    };
    return colors[notionColor] || 'bg-blue-500';
}