import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Resposta } from "../types";

interface QuizContextType {
  respostas: Resposta[];
  obterRespostas: () => Resposta[];
  registrarResposta: (resposta: Resposta) => void;
  calcularEstatisticas: () => { pontos: number; acertos: number; erros: number; respondidas: number };
  resetar: () => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [respostas, setRespostas] = useState<Resposta[]>(() => {
    const salvo = sessionStorage.getItem("quiz_respostas");
    return salvo ? JSON.parse(salvo) : [];
  });

  const obterRespostas = useCallback(() => respostas, [respostas]);

  const registrarResposta = useCallback((resposta: Resposta) => {
    setRespostas((prev) => {
      const novo = [...prev, resposta];
      sessionStorage.setItem("quiz_respostas", JSON.stringify(novo));
      return novo;
    });
  }, []);

  const calcularEstatisticas = useCallback(() => {
    const pontos = respostas.reduce((acc, r) => acc + r.pontos_ganhos, 0);
    const acertos = respostas.filter((r) => r.acertou).length;
    const erros = respostas.filter((r) => !r.acertou).length;
    return { pontos, acertos, erros, respondidas: respostas.length };
  }, [respostas]);

  const resetar = useCallback(() => {
    sessionStorage.removeItem("quiz_respostas");
    setRespostas([]);
  }, []);

  return (
    <QuizContext.Provider value={{ respostas, obterRespostas, registrarResposta, calcularEstatisticas, resetar }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz deve ser usado dentro de QuizProvider");
  return ctx;
}
