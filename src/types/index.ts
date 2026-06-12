export interface Questao {
  id: string;
  categoria: string;
  pergunta: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  resposta_correta: "A" | "B" | "C" | "D";
  pontos_acerto: number;
  pontos_erro: number;
  feedback_acerto: string;
  feedback_erro: string;
}

export interface Resposta {
  id: string;
  questao_id: string;
  resposta_marcada: "A" | "B" | "C" | "D";
  acertou: boolean;
  respondida_em: string;
}
