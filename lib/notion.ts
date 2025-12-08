// lib/notion.ts

const NOTION_KEY = process.env.NOTION_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

export async function getLeads() {
  if (!NOTION_KEY || !NOTION_DATABASE_ID) {
    console.error("🚨 ERRO: Variáveis de ambiente do Notion não encontradas.");
    return [];
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // MANTIDO: Ordenação para priorizar Pendentes
        sorts: [
            { property: 'Status Foco', direction: 'ascending' }, 
            { timestamp: 'created_time', direction: 'descending' }
        ]
        // REMOVIDO: O filtro que escondia os descartados globalmente.
        // Agora eles vêm do banco e filtramos apenas na tela de Foco.
      }),
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Notion: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const leads = data.results.map((page: any) => {
      const props = page.properties;

      // --- Helper: Busca propriedade ignorando maiúsculas/minúsculas e espaços ---
      const getProp = (keys: string[]) => {
        for (const key of keys) {
          const foundKey = Object.keys(props).find(k => 
            k.toLowerCase().trim() === key.toLowerCase().trim()
          );
          if (foundKey) return props[foundKey];
        }
        return null;
      };

      // 1. Nome
      const propNome = getProp(['Nome', 'Name', 'Lead', 'Cliente']);
      const nome = propNome?.title?.[0]?.plain_text || 'Sem Nome';

      // 2. Telefone
      const propFone = getProp(['Telefone', 'Phone', 'Celular', 'Whatsapp']);
      const telefone = propFone?.rich_text?.[0]?.plain_text || 
                       propFone?.phone_number || 
                       'Sem Telefone';

      // 3. Status
      const propStatus = getProp(['Status', 'Estágio', 'Stage']);
      const status = propStatus?.select?.name || 
                     propStatus?.rich_text?.[0]?.plain_text || 
                     'Novo Lead';

      // 4. Localização
      const propLoc = getProp(['Localização', 'Cidade', 'Cidades', 'Localização de Interesse']);
      let cidades: string[] = [];
      if (propLoc) {
        if (propLoc.type === 'multi_select') cidades = propLoc.multi_select.map((o: any) => o.name);
        else if (propLoc.type === 'select' && propLoc.select) cidades = [propLoc.select.name];
        else if (propLoc.type === 'rich_text') {
          const t = propLoc.rich_text.map((part: any) => part.plain_text).join('');
          if(t) cidades = t.split(',').map((c: string) => c.trim());
        }
      }
      if (cidades.length === 0) cidades = ['Não informada'];

      // 5. Perfil
      const propPerfil = getProp(['Perfil', 'Tipo', 'Interesse']);
      let perfil = 'Geral';
      
      if (propPerfil) {
        if (propPerfil.type === 'select') {
          perfil = propPerfil.select?.name || 'Geral';
        } else if (propPerfil.type === 'rich_text') {
          const textoCompleto = propPerfil.rich_text
            .map((part: any) => part.plain_text)
            .join('')
            .trim();
            
          if (textoCompleto.length > 0) {
            perfil = textoCompleto;
          }
        }
      }

      // 6. Score
      const propScore = getProp(['Leadscore', 'Score', 'Pontuação', 'Lead Score']);
      let scoreNum = 0;
      
      if (propScore?.type === 'number') {
        scoreNum = propScore.number ?? 0;
      } else if (propScore?.type === 'rich_text') {
         const txt = propScore.rich_text?.[0]?.plain_text || '0';
         scoreNum = parseInt(txt.replace(/\D/g, ''), 10) || 0;
      } else {
        scoreNum = status.toLowerCase().includes('quente') ? 90 : 
                   status.toLowerCase().includes('morno') ? 50 : 20;
      }

      // 7. Resumo
      const propResumo = getProp(['Resumo', 'Obs', 'Observações']);
      const resumo = propResumo?.rich_text?.map((t: any) => t.plain_text).join('') || '';

      // 8. Status Foco
      const propStatusFoco = getProp(['Status Foco', 'Foco']);
      const statusFoco = propStatusFoco?.select?.name || 'Pendente';

      const dataCriacao = props.Data?.date?.start || page.created_time;

      return {
        id: page.id,
        nome: nome,
        telefone: telefone,
        status: status,
        cidades: cidades,
        interesse: resumo,
        createdAt: dataCriacao,
        perfil: perfil,
        leadScore: scoreNum,
        statusFoco: statusFoco
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR LEADS:", error.message);
    return [];
  }
}