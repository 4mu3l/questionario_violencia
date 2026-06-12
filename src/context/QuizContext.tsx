import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Resposta } from "../types";

interface QuizContextType {
  respostas: Resposta[];
  obterRespostas: () => Resposta[];
  registrarResposta: (resposta: Resposta) => void;
}

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [respostas, setRespostas] = useState<Resposta[]>([]);

  const obterRespostas = useCallback(() => respostas, [respostas]);

  const registrarResposta = useCallback((resposta: Resposta) => {
    setRespostas((prev) => [...prev, resposta]);
  }, []);

  return (
    <QuizContext.Provider value={{ respostas, obterRespostas, registrarResposta }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz deve ser usado dentro de QuizProvider");
  return ctx;
}