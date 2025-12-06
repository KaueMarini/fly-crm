// types/kanban.ts
export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  status: string; // Ex: "Novo Lead", "Em Contato" (Nome exato do Notion)
  funil: string;  // Ex: "Vendas", "Locação"
  score: number;
  empresa?: string;
  createdAt: string;
};

export type KanbanStage = {
  id: string; // Nome exato do status no Notion (Ex: "Novo Lead")
  title: string;
  color: string;
  rules?: {
    requireObs?: boolean;
  };
};

export type Pipeline = {
  id: string; // Ex: "vendas"
  title: string;
  stages: KanbanStage[];
};