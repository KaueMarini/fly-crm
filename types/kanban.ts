// types/kanban.ts
export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  
  // ONDE O LEAD ESTÁ (Colunas do Kanban)
  status: string; // Ex: "Novo Lead", "Em Contato"
  funil: string;  // Ex: "Vendas", "Locação"
  
  // QUALIDADE DO LEAD (Badges coloridos)
  leadScoreTag: string; // Ex: "Quente", "Morno", "Frio"
  leadScore: number;    // Ex: 90, 50, 20
  
  cidade: string;
  interesse: string;
  createdAt: string;
};

export type Stage = {
  id: string;
  title: string;
  color: string;
  rules?: { requireObs?: boolean };
};

export type Pipeline = {
  id: string;
  title: string;
  stages: Stage[];
};