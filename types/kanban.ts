export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  
  // Kanban (Coluna)
  status: string; 
  
  // Dados
  leadScore: string;    // "Quente", "Morno", "Frio"
  localizacao: string;
  perfil: string;
  resumo: string;
  data: string;
  funil: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
  color: string;
};