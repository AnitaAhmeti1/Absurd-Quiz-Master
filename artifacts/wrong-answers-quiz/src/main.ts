import "./style.css";

// ---- Types ----
interface QuizQuestion {
  question: string;
  answers: string[];
}

interface AppState {
  screen: "home" | "loading" | "question" | "reveal";
  topic: string;
  questionCount: number;
  streak: number;
  currentQuestion: QuizQuestion | null;
  pickedAnswer: string | null;
  explanation: string | null;
  error: string | null;
}

// ---- State ----
const state: AppState = {
  screen: "home",
  topic: "",
  questionCount: 0,
  streak: 0,
  currentQuestion: null,
  pickedAnswer: null,
  explanation: null,
  error: null,
};

const PRESET_TOPICS = [
  { icon: "🌍", label: "Geography" },
  { icon: "🔬", label: "Science" },
  { icon: "📜", label: "History" },
  { icon: "🎬", label: "Movies" },
  { icon: "🍕", label: "Food" },
  { icon: "⚽", label: "Sports" },
  { icon: "🎵", label: "Music" },
  { icon: "💻", label: "Technology" },
];

const LETTERS = ["A", "B", "C", "D"];

const LOADING_QUIPS = [
  "Cooking up some nonsense...",
  "Consulting our panel of wrong experts...",
  "Fabricating plausible rubbish...",
  "Asking someone who definitely doesn't know...",
  "Generating certified incorrect answers...",
  "Digging through the wrong encyclopedia...",
];

const STREAK_MESSAGES: Record<number, string> = {
  3:  "Hat-trick of wrongness!",
  5:  "5 in a row! You're on fire!",
  7:  "Lucky 7 wrong answers!",
  10: "10 WRONG! You're unstoppable!",
  15: "15 wrong answers. Are you even trying to be right?",
  20: "20 wrong answers! Certified expert in being incorrect!",
};

// ---- API ----
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function generateQuestion(topic: string): Promise<QuizQuestion> {
  const res = await fetch(`${BASE}/api/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<QuizQuestion>;
}

async function fetchExplanation(topic: string, question: string, answer: string): Promise<string> {
  const res = await fetch(`${BASE}/api/quiz/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, question, answer }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { explanation: string };
  return data.explanation;
}

// ---- Render ----
function render() {
  const app = document.getElementById("app")!;
  app.innerHTML = renderHeader() + renderScreen();
  attachListeners();
}

function renderHeader(): string {
  return `
    <header class="header">
      <div class="logo">
        <span class="logo-emoji">🎉</span>
        Wrong Answers Only
      </div>
      <div class="score-bar">
        <div class="score-pill">
          Q&nbsp;<span class="value">${state.questionCount}</span>
        </div>
        <div class="score-pill streak-pill">
          🔥&nbsp;<span class="value">${state.streak}</span>
        </div>
      </div>
    </header>
  `;
}

function renderScreen(): string {
  switch (state.screen) {
    case "home":     return renderHome();
    case "loading":  return renderLoading();
    case "question": return renderQuestion();
    case "reveal":   return renderReveal();
  }
}

function renderHome(): string {
  const topicBtns = PRESET_TOPICS.map(t => `
    <button class="topic-btn${state.topic === t.label ? " selected" : ""}" data-topic="${t.label}">
      <span class="topic-icon">${t.icon}</span>${t.label}
    </button>
  `).join("");

  const customVal = state.topic && !PRESET_TOPICS.find(t => t.label === state.topic) ? state.topic : "";

  return `
    <div class="card">
      <div class="home-eyebrow">🎮 Party Quiz</div>
      <h1 class="home-title">
        <span class="wrong">Wrong Answers</span>Only.
      </h1>
      <p class="home-subtitle">
        Pick a topic. Every question has 4 options — and every single one is wrong.
        That's not a bug. That's the game.
      </p>

      <p class="section-label">Pick a topic</p>
      <div class="topics-grid">${topicBtns}</div>

      <div class="divider">or</div>

      <div class="custom-topic-row">
        <input
          class="custom-input"
          id="custom-topic"
          type="text"
          placeholder="Type any topic..."
          value="${customVal}"
          maxlength="60"
        />
        <button
          class="btn-primary"
          id="start-btn"
          ${state.topic.trim() ? "" : "disabled"}
        >Let's Go!</button>
      </div>

      ${state.error ? `<div class="error-box">😬 ${state.error}</div>` : ""}

      ${state.questionCount > 0 ? `
        <p class="played-note">
          You've answered ${state.questionCount} question${state.questionCount !== 1 ? "s" : ""} — all of them wrong!
        </p>
      ` : ""}
    </div>
  `;
}

function renderLoading(): string {
  const quip = LOADING_QUIPS[Math.floor(Math.random() * LOADING_QUIPS.length)];
  return `
    <div class="card">
      <div class="loading-screen">
        <div class="loading-dots">
          <span></span><span></span><span></span><span></span>
        </div>
        <p class="loading-text">${quip}</p>
      </div>
    </div>
  `;
}

function renderQuestion(): string {
  if (!state.currentQuestion) return "";
  const { question, answers } = state.currentQuestion;

  const answerBtns = answers.map((a, i) => `
    <button class="answer-btn" data-index="${i}" data-answer="${encodeURIComponent(a)}">
      <span class="answer-letter">${LETTERS[i]}</span>
      <span>${a}</span>
    </button>
  `).join("");

  return `
    <div class="card">
      <div class="topic-tag">
        <span class="question-counter">#${state.questionCount + 1}</span>
        ${state.topic}
      </div>
      <p class="question-text">${question}</p>
      <div class="answers-grid">${answerBtns}</div>
    </div>
  `;
}

function renderReveal(): string {
  if (!state.currentQuestion || !state.pickedAnswer) return "";
  const { question } = state.currentQuestion;

  const streakMsg = STREAK_MESSAGES[state.streak];
  const streakBanner = streakMsg ? `
    <div class="streak-banner">🔥 ${streakMsg}</div>
  ` : "";

  const explanationContent = state.explanation
    ? `<div class="explanation-box">💬 ${state.explanation}</div>`
    : state.error
    ? `<div class="error-box">Couldn't load the verdict: ${state.error}</div>`
    : `<div class="explanation-box">
         <div class="explanation-loading">
           <div class="explain-dots"><span></span><span></span><span></span></div>
           Calculating exactly how wrong you are...
         </div>
       </div>`;

  return `
    <div class="card">
      <div class="reveal-badge">❌ Nope! Still wrong!</div>

      ${streakBanner}

      <p class="question-text" style="font-size:1rem;margin-bottom:14px;">${question}</p>

      <div class="picked-answer-box">
        <strong>Your answer</strong>
        ${state.pickedAnswer}
      </div>

      ${explanationContent}

      <div class="reveal-actions">
        <button class="btn-primary" id="next-btn">Next Question &rarr;</button>
        <button class="btn-secondary" id="home-btn">Change Topic</button>
      </div>
    </div>
  `;
}

// ---- Event Listeners ----
function attachListeners() {
  const screen = state.screen;

  if (screen === "home") {
    document.querySelectorAll<HTMLButtonElement>(".topic-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.topic = btn.dataset.topic ?? "";
        const customInput = document.getElementById("custom-topic") as HTMLInputElement;
        if (customInput) customInput.value = "";
        render();
      });
    });

    const customInput = document.getElementById("custom-topic") as HTMLInputElement;
    if (customInput) {
      customInput.addEventListener("input", () => {
        state.topic = customInput.value.trim();
        const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
        if (startBtn) startBtn.disabled = !state.topic;
      });
      customInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && state.topic.trim()) startQuiz();
      });
    }

    const startBtn = document.getElementById("start-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (state.topic.trim()) startQuiz();
      });
    }
  }

  if (screen === "question") {
    document.querySelectorAll<HTMLButtonElement>(".answer-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const answer = decodeURIComponent(btn.dataset.answer ?? "");
        pickAnswer(btn, answer);
      });
    });
  }

  if (screen === "reveal") {
    document.getElementById("next-btn")?.addEventListener("click", nextQuestion);
    document.getElementById("home-btn")?.addEventListener("click", goHome);
  }
}

// ---- Actions ----
async function startQuiz() {
  state.error = null;
  state.screen = "loading";
  render();

  try {
    state.currentQuestion = await generateQuestion(state.topic);
    state.screen = "question";
    render();
  } catch (err) {
    state.screen = "home";
    state.error = err instanceof Error ? err.message : "Something went wrong — try again!";
    render();
  }
}

async function pickAnswer(btn: HTMLButtonElement, answer: string) {
  document.querySelectorAll<HTMLButtonElement>(".answer-btn").forEach(b => {
    b.disabled = true;
  });

  btn.classList.add("wrong");

  state.pickedAnswer = answer;
  state.questionCount += 1;
  state.streak += 1;

  await sleep(500);

  state.screen = "reveal";
  state.explanation = null;
  state.error = null;
  render();

  try {
    const explanation = await fetchExplanation(
      state.topic,
      state.currentQuestion!.question,
      answer
    );
    state.explanation = explanation;
  } catch (err) {
    state.error = err instanceof Error ? err.message : "Couldn't load explanation";
  }
  render();
}

async function nextQuestion() {
  state.error = null;
  state.screen = "loading";
  render();

  try {
    state.currentQuestion = await generateQuestion(state.topic);
    state.screen = "question";
    render();
  } catch (err) {
    state.screen = "home";
    state.error = err instanceof Error ? err.message : "Something went wrong — try again!";
    render();
  }
}

function goHome() {
  state.screen = "home";
  state.streak = 0;
  state.error = null;
  render();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- Boot ----
render();
