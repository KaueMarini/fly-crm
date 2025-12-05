export type Lead = {
  id: string;
  nome: string;
  empresa?: string;
  telefone: string;
  status: string; // A coluna do Kanban
  funil: string;  // 'vendas' | 'locacao' | 'pos-venda'
  score: number;
  valor?: number;
};

export type Column = {
  id: string;
  title: string;
  color: string;
  rules?: {
    requireObservation?: boolean; // Regra: Exige observação ao entrar aqui?
  };
};