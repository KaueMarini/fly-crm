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
        sorts: [
            { property: 'Status Foco', direction: 'ascending' }, 
            { timestamp: 'created_time', direction: 'descending' }
        ]
      }),
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Notion: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const leads = data.results.map((page: any) => {
      const props = page.properties;

      // Helper para buscar propriedades (Case Insensitive + Trim)
      const getProp = (keys: string[]) => {
        for (const key of keys) {
          const foundKey = Object.keys(props).find(k => 
            k.toLowerCase().trim() === key.toLowerCase().trim()
          );
          if (foundKey) return props[foundKey];
        }
        return null;
      };

      // 1. Campos Básicos
      const propNome = getProp(['Nome', 'Name', 'Lead', 'Cliente']);
      const nome = propNome?.title?.[0]?.plain_text || 'Sem Nome';

      const propFone = getProp(['Telefone', 'Phone', 'Celular', 'Whatsapp']);
      const telefone = propFone?.rich_text?.[0]?.plain_text || propFone?.phone_number || 'Sem Telefone';

      // 2. Status (CORREÇÃO: Padrão "Em Contato")
      const propStatus = getProp(['Status', 'Estágio', 'Stage', 'Situação']);
      let status = 'Em Contato'; 
      
      if (propStatus) {
        if (propStatus.type === 'select') {
          status = propStatus.select?.name || 'Em Contato';
        } else if (propStatus.type === 'rich_text') {
          status = propStatus.rich_text?.[0]?.plain_text || 'Em Contato';
        } else if (propStatus.type === 'status') {
          status = propStatus.status?.name || 'Em Contato';
        }
      }
      // Se vier vazio/nulo, força "Em Contato"
      if (!status || status.trim() === '') status = 'Em Contato';

      const propLoc = getProp(['Localização', 'Cidade', 'Cidades', 'Localização de Interesse']);
      let cidades: string[] = ['Não informada'];
      if (propLoc?.type === 'multi_select') cidades = propLoc.multi_select.map((o: any) => o.name);
      else if (propLoc?.type === 'rich_text') {
         const t = propLoc.rich_text.map((part: any) => part.plain_text).join('');
         if(t) cidades = t.split(',').map((c: string) => c.trim());
      }

      // 3. Perfil
      const propPerfil = getProp(['Perfil', 'Tipo', 'Interesse']);
      let perfil = 'Geral';
      if (propPerfil) {
        if (propPerfil.type === 'select') perfil = propPerfil.select?.name || 'Geral';
        else if (propPerfil.type === 'rich_text') {
          // Pega texto completo para ler "Investidor" corretamente
          perfil = propPerfil.rich_text.map((part: any) => part.plain_text).join('').trim() || 'Geral';
        }
      }

      // 4. Resumo & Extração de Valor (Ticket Médio Inteligente)
      const propResumo = getProp(['Resumo', 'Obs', 'Observações']);
      const resumo = propResumo?.rich_text?.map((t: any) => t.plain_text).join('') || '';

      let valorExtraido = 0;
      if (resumo) {
        const texto = resumo.toLowerCase().replace(/\./g, '.').replace(/,/g, '.'); // Normaliza para ponto
        
        // Regex poderosa para "1.3M", "800k", "1,5 mi"
        const regexSufixo = /([\d\.,]+)\s*(k|mil|m|mi|milh[aã]o|milhoes)/i;
        const matchSufixo = texto.match(regexSufixo);

        if (matchSufixo) {
          // Normaliza vírgula para ponto JS
          const numeroStr = matchSufixo[1].replace(',', '.'); 
          // Limpa pontos extras de milhar se houver (ex: 1.200.000 -> 1200000)
          const numeroLimpo = parseFloat(numeroStr.replace(/\.(?=.*\.)/g, '')); 
          
          const multiplicador = matchSufixo[2];

          if (multiplicador.startsWith('k') || multiplicador.startsWith('mil')) {
            valorExtraido = numeroLimpo * 1000;
          } else if (multiplicador.startsWith('m')) {
            valorExtraido = numeroLimpo * 1000000;
          }
        } 
        else {
           // Regex para valor monetário explícito (ex: R$ 850.000)
           const regexDinheiro = /r\$\s*([\d\.,]+)/i;
           const matchDinheiro = texto.match(regexDinheiro);
           
           if (matchDinheiro) {
             // Remove pontos de milhar e troca vírgula decimal
             const limpo = matchDinheiro[1].replace(/\./g, '').replace(',', '.');
             valorExtraido = parseFloat(limpo);
           }
        }
      }

      // Fallback baseada no perfil se não achar nada (Valores de Mercado Atualizados)
      if (!valorExtraido || valorExtraido === 0) {
         if (perfil.toLowerCase().includes('investidor')) valorExtraido = 900000; // Média para "até 1.3M"
         else if (perfil.toLowerCase().includes('moradia')) valorExtraido = 1100000; // Média "700k - 1.5M"
         else valorExtraido = 800000;
      }

      // Trava de segurança (Sanity Check)
      if (valorExtraido < 50000) valorExtraido = 800000; // Ninguém compra imóvel de 50 mil
      if (valorExtraido > 30000000) valorExtraido = 1500000; // Evita distorção absurda

      // 5. Score
      const propScore = getProp(['Leadscore', 'Score', 'Pontuação', 'Lead Score']);
      let scoreNum = 0;
      if (propScore?.type === 'number') scoreNum = propScore.number ?? 0;
      else if (propScore?.type === 'rich_text') {
         const txt = propScore.rich_text?.[0]?.plain_text || '0';
         scoreNum = parseInt(txt.replace(/\D/g, ''), 10) || 0;
      } else {
        scoreNum = status.toLowerCase().includes('quente') ? 90 : 
                   status.toLowerCase().includes('morno') ? 50 : 20;
      }

      // 6. Status Foco
      const propStatusFoco = getProp(['Status Foco', 'Foco']);
      const statusFoco = propStatusFoco?.select?.name || 'Pendente';

      const dataCriacao = props.Data?.date?.start || page.created_time;

      return {
        id: page.id,
        nome,
        telefone,
        status, 
        cidades,
        interesse: resumo,
        createdAt: dataCriacao,
        perfil,
        leadScore: scoreNum,
        statusFoco,
        orcamento: valorExtraido
      };
    });

    return leads;

  } catch (error: any) {
    console.error("❌ ERRO AO BUSCAR LEADS:", error.message);
    return [];
  }
}