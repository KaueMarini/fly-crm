import { Client } from '@notionhq/client';

if (!process.env.NOTION_KEY) throw new Error("Missing NOTION_KEY");
if (!process.env.NOTION_DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID");

const notion = new Client({ auth: process.env.NOTION_KEY });

// --- 1. Função para Ler as Etapas (Colunas) do Notion ---
export async function getPipelineStages() {
  const databaseId = process.env.NOTION_DATABASE_ID as string;
  
  const response = await notion.databases.retrieve({ database_id: databaseId });
  const properties = response.properties as any;
  
  // Verifica se existe a coluna Status
  const statusProp = properties['Status'];
  
  if (!statusProp || statusProp.type !== 'select') {
      return [];
  }

  // Retorna as opções na ordem que estão no Notion
  return statusProp.select.options.map((opt: any) => ({
      id: opt.name, // O ID será o próprio nome (Ex: "Novo Lead")
      title: opt.name,
      color: mapColor(opt.color)
  }));
}

// --- 2. Função para Ler os Leads ---
export async function getLeads() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    });

    return response.results.map((page: any) => {
      const props = page.properties;

      const telefone = props.Telefone?.title?.[0]?.plain_text || 'Sem Telefone';
      const nome = props.Nome?.rich_text?.[0]?.plain_text || 'Sem Nome';
      const status = props.Status?.select?.name || 'Novo Lead';
      const funil = props.Funil?.select?.name || 'Vendas'; // Se tiver coluna Funil
      
      // Score
      const scoreTag = props.Leadscore?.select?.name || 'Frio';
      let scoreNum = 20;
      if (scoreTag.toLowerCase().includes('quente')) scoreNum = 90;
      else if (scoreTag.toLowerCase().includes('morno')) scoreNum = 50;

      return {
        id: page.id,
        nome,
        telefone,
        status, // Agora usamos o nome real do Notion (Ex: "Em Contato") como ID
        funil,
        score: scoreNum,
        createdAt: page.created_time,
      };
    });

  } catch (error: any) {
    console.error("Erro Notion:", error);
    return [];
  }
}

// Auxiliar: Traduz cores do Notion para Tailwind
function mapColor(notionColor: string) {
    const colors: Record<string, string> = {
        'default': 'bg-slate-500',
        'gray': 'bg-slate-500',
        'brown': 'bg-orange-800',
        'orange': 'bg-orange-500',
        'yellow': 'bg-yellow-500',
        'green': 'bg-emerald-500',
        'blue': 'bg-blue-500',
        'purple': 'bg-purple-500',
        'pink': 'bg-pink-500',
        'red': 'bg-red-500',
    };
    return colors[notionColor] || 'bg-blue-500';
}