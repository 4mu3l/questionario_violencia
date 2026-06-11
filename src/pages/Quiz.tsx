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
  const { obterRespostas, registrarResposta, calcularEstatisticas, resetar } = useQuiz();
  const [questoesPendentes, setQuestoesPendentes] = useState<Questao[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [feedback, setFeedback] = useState<{ acertou: boolean; pontos: number; mensagem: string } | null>(null);
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
    const pontos_ganhos = acertou ? questao.pontos_acerto : questao.pontos_erro;
    const mensagem = acertou ? questao.feedback_acerto : questao.feedback_erro;

    const resposta = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      questao_id: questao.id,
      resposta_marcada: alternativaSelecionada,
      acertou,
      pontos_ganhos,
      respondida_em: new Date().toISOString(),
    };

    registrarResposta(resposta);
    setFeedback({ acertou, pontos: pontos_ganhos, mensagem });

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

  function reiniciar() {
    resetar();
    carregarQuestoes();
  }

  if (carregando) {
    return (
      <div className="quiz-container">
        <div className="carregando">Carregando questoes...</div>
      </div>
    );
  }

  if (finalizado) {
    const stats = calcularEstatisticas();
    const total = questoesMock.length;
    const percentual = total > 0 ? Math.round((stats.acertos / total) * 100) : 0;

    return (
      <div className="quiz-container">
        <div className="quiz-card resultado-card">
          <h1 className="resultado-titulo">Questionario Concluido!</h1>
          <p className="resultado-sub">Voce respondeu todas as {total} questoes sobre conscientizacao de violencias.</p>

          <div className="resultado-stats">
            <div className="stat-box">
              <span className="stat-numero">{stats.acertos}</span>
              <span className="stat-rotulo">Acertos</span>
            </div>
            <div className="stat-box">
              <span className="stat-numero">{stats.erros}</span>
              <span className="stat-rotulo">Erros</span>
            </div>
            <div className="stat-box">
              <span className="stat-numero">{stats.pontos}</span>
              <span className="stat-rotulo">Pontos</span>
            </div>
          </div>

          <div className="resultado-percentual">
            <div className="percentual-circulo">
              <span className="percentual-valor">{percentual}%</span>
              <span className="percentual-label">de acerto</span>
            </div>
          </div>

          <p className="resultado-mensagem">
            {percentual >= 80
              ? "Excelente! Voce demonstra grande consciencia sobre como identificar e combater as violencias."
              : percentual >= 50
              ? "Bom trabalho! Ha ainda alguns pontos para aprimorar seu conhecimento."
              : "Continue aprendendo! Cada resposta e uma oportunidade de crescimento."}
          </p>

          <div className="resultado-acoes">
            <button className="btn-primario" onClick={reiniciar}>
              Refazer Questionario
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questoesPendentes.length === 0) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <h2>Parabens!</h2>
          <p>Voce ja respondeu todas as questoes desta sessao.</p>
          <button className="btn-primario" onClick={reiniciar} style={{ marginTop: "20px" }}>
            Refazer Questionario
          </button>
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
              {feedback.acertou ? "✅ Acertou!" : "❌ Errou!"}
              <span className="feedback-pontos">
                {feedback.acertou ? `+${feedback.pontos}` : `${feedback.pontos}`} pontos
              </span>
            </div>
            <p className="feedback-mensagem">{feedback.mensagem}</p>
          </div>
        )}
      </div>
    </div>
  );
}
