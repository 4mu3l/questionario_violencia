import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { questoesMock } from "../data/mock";
import type { Questao } from "../types";

const corPorCategoria: Record<string, string> = {
  "Feminicidio e Violencia Domestica": "quiz-emocional",
  "Abuso e Violencia Sexual": "quiz-emocional",
  "Bullying e Cyberbullying": "quiz-protecao",
  "Maus-tratos aos Animais": "quiz-protecao",
  "Trabalho Escravo e Direitos Humanos": "quiz-estrutural",
  "Racismo e Intolerancia Religiosa": "quiz-estrutural",
};

export default function Quiz() {
  const { obterRespostas, registrarResposta } = useQuiz();
  const [questoesPendentes, setQuestoesPendentes] = useState<Questao[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState<{ acertou: boolean; mensagem: string } | null>(null);
  const [finalizado, setFinalizado] = useState(false);

  useEffect(() => {
    carregarQuestoes();
  }, []);

  function carregarQuestoes() {
    const respostas = obterRespostas();
    const respondidas = new Set(respostas.map((r) => r.questao_id));
    const pendentes = questoesMock.filter((q: Questao) => !respondidas.has(q.id));
    setQuestoesPendentes(pendentes);
    setQuestaoAtual(0);
    setFinalizado(false);
    setCarregando(false);
  }

  function selecionarAlternativa(letra: "A" | "B" | "C" | "D") {
    if (enviando || feedback) return;
    setAlternativaSelecionada(letra);
  }

  function confirmarResposta() {
    if (questoesPendentes.length === 0 || !alternativaSelecionada || enviando) return;

    const questao = questoesPendentes[questaoAtual];
    setEnviando(true);

    const acertou = alternativaSelecionada === questao.resposta_correta;
    const mensagem = acertou ? questao.feedback_acerto : questao.feedback_erro;

    const resposta = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      questao_id: questao.id,
      resposta_marcada: alternativaSelecionada,
      acertou,
      respondida_em: new Date().toISOString(),
    };

    registrarResposta(resposta);
    setFeedback({ acertou, mensagem });

    const isUltima = questaoAtual >= questoesPendentes.length - 1;

    setTimeout(() => {
      setFeedback(null);
      setAlternativaSelecionada(null);
      if (isUltima) {
        setFinalizado(true);
      } else {
        setQuestaoAtual((prev) => prev + 1);
      }
      setEnviando(false);
    }, 4000);
  }

  if (carregando) {
    return (
      <div className="quiz-container">
        <div className="carregando">Carregando questoes...</div>
      </div>
    );
  }

  if (finalizado) {
    return (
      <div className="quiz-container">
        <div className="quiz-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px", color: "#FFFFFF" }}>
            Obrigado!
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#DDD6FE", lineHeight: "1.6" }}>
            Voce completou o questionario sobre conscientizacao de violencias.
          </p>
          <p style={{ fontSize: "1rem", color: "#B8A9C9", marginTop: "16px" }}>
            Suas respostas ajudam a construir uma sociedade mais consciente.
          </p>
        </div>
      </div>
    );
  }

  if (questoesPendentes.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card" style={{ textAlign: "center", padding: "60px 40px" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "20px", color: "#FFFFFF" }}>
            Obrigado!
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#DDD6FE", lineHeight: "1.6" }}>
            Voce completou o questionario sobre conscientizacao de violencias.
          </p>
          <p style={{ fontSize: "1rem", color: "#B8A9C9", marginTop: "16px" }}>
            Suas respostas ajudam a construir uma sociedade mais consciente.
          </p>
        </div>
      </div>
    );
  }

  const questao = questoesPendentes[questaoAtual];
  const progresso = ((questaoAtual + 1) / questoesPendentes.length) * 100;
  const classeCor = corPorCategoria[questao.categoria] || "";

  return (
    <div className={`quiz-container ${classeCor}`}>
      <header className="quiz-header">
        <div className="progresso-barra">
          <div className="progresso-preenchido" style={{ width: `${progresso}%` }} />
        </div>
        <span className="progresso-texto">
          Questao {questaoAtual + 1} de {questoesPendentes.length}
        </span>
      </header>

      <div className="quiz-card">
        <div className="categoria-tag">{questao.categoria}</div>
        <h2 className="pergunta">{questao.pergunta}</h2>

        <div className="alternativas">
          {(["A", "B", "C", "D"] as const).map((letra) => {
            const isSelecionada = alternativaSelecionada === letra;
            const isCorreta = feedback && questao.resposta_correta === letra;
            const isErradaSelecionada = feedback && !feedback.acertou && isSelecionada;

            let classe = "alternativa";
            if (isSelecionada && !feedback) classe += " selecionada";
            if (isCorreta && feedback) classe += " correta";
            if (isErradaSelecionada) classe += " errada-selecionada";

            return (
              <button
                key={letra}
                className={classe}
                onClick={() => selecionarAlternativa(letra)}
                disabled={!!feedback}
              >
                <span className="letra">{letra}</span>
                <span className="texto">
                  {letra === "A" ? questao.alternativa_a :
                   letra === "B" ? questao.alternativa_b :
                   letra === "C" ? questao.alternativa_c :
                   questao.alternativa_d}
                </span>
              </button>
            );
          })}
        </div>

        {!feedback && (
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              className="btn-primario"
              onClick={confirmarResposta}
              disabled={!alternativaSelecionada || enviando}
              style={{ maxWidth: "300px" }}
            >
              {enviando ? "Enviando..." : "Confirmar Resposta"}
            </button>
          </div>
        )}

        {feedback && (
          <div className={`feedback-educativo ${feedback.acertou ? "acerto" : "erro"}`}>
            <div className="feedback-titulo">
              {feedback.acertou ? " Acertou!" : " Errou!"}
            </div>
            <p className="feedback-mensagem">{feedback.mensagem}</p>
          </div>
        )}
      </div>
    </div>
  );
}