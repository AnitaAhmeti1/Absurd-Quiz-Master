# 🎉 Wrong Answers Only

> A quiz game where every single answer is wrong. That's not a bug. That's the whole point.

**[▶ Play it live](https://absurd-quiz-master--anitaaahmetii.replit.app)**

---

## What is this?

Wrong Answers Only is a web-based quiz game built for the Solution25 Applied AI Engineer internship task.

The user picks a topic - Geography, Science, History, Movies, Food, Sports, Music, Technology, or anything they type in - and the AI generates a real, factual question with **four confidently wrong answers**. No correct answer exists. Every option is incorrect. That's the joke.

Pick one, and you'll get a witty explanation of exactly why you're wrong.

---

## Features

- 8 built-in topic categories plus a free-text custom topic input
- AI generates a genuine question with 4 plausible-but-wrong answers, each wrong in a different way
- Animated feedback when you pick - the answer shakes, turns red, and an explanation appears
- Streak counter tracking how many wrong answers you've picked in a row (all of them, naturally)
- API key stays server-side only - never exposed to the browser
- Fully deployed on Replit with a public URL

---

## How to run it

### Option 1 — Just open the live URL
[https://absurd-quiz-master--anitaaahmetii.replit.app](https://absurd-quiz-master--anitaaahmetii.replit.app)

No setup needed.

### Option 2 — Run it yourself from this repo

1. Clone the repo:
   ```bash
   git clone https://github.com/AnitaAhmeti1/Absurd-Quiz-Master.git
   cd Absurd-Quiz-Master
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your Anthropic API key as an environment variable:
   ```bash
   export ANTHROPIC_API_KEY=your_key_here
   ```
   Or create a `.env` file:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

4. Start the app:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

---

## The prompt I settled on

After a few iterations, this is the system prompt that produced the most consistently funny and wrong answers:

```
You are the host of a quiz game called "Wrong Answers Only". 
Your job is to generate a genuine factual question about the given topic, 
then provide exactly 4 answer options - all of which are WRONG. 
There must be no correct answer among the four options.

Rules:
- The question must be real and factual (e.g. "What is the capital of Australia?")
- All 4 answers must be plausibly wrong - not random nonsense, but confidently incorrect
- Each answer should be wrong in a different way (one close, one absurd, one historical, one funny)
- Never include the correct answer
- Return JSON only in this format:
  { "question": "...", "answers": ["...", "...", "...", "..."] }
```

For the explanation after a pick:
```
The user picked "[answer]" for the question "[question]". 
Write a short, witty explanation of why this answer is wrong. 
Be funny but factually accurate. 2-3 sentences max.
```

### What I tried first

My first prompt asked Claude to "generate wrong answers" without enough constraints -it kept sneaking the correct answer in as one of the four options. Adding *"There must be no correct answer among the four options"* and *"Never include the correct answer"* in two separate places fixed it. The instruction repetition was intentional.

---

## What I would do with more time

- **User accounts and leaderboards** - persistent streak tracking across sessions, not just in-memory
- **Difficulty levels** - "Obviously Wrong" vs "Dangerously Plausible" modes
- **Multiplayer** - same question, race to pick the wrong answer fastest
- **Share your streak** - generate a shareable card like "I got 12 wrong in a row on Wrong Answers Only"
- **Better mobile layout** - the answer buttons get cramped on small screens
- **Rate limiting** - right now there's no protection against someone hammering the API endpoint

---

## Built with

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Backend**: Node.js / Express
- **AI**: Claude API (claude-sonnet-4-6) via Anthropic
- **Deployed on**: Replit

---

## How I built it

Built using Replit Agent with the following initial prompt:

> *"Build a 'Wrong Answers Only' quiz web app. The user picks a topic, then an AI generates a question with 4 plausible-but-wrong multiple choice answers (no correct answer exists - that's the joke). When the user picks an answer, show a witty explanation of why it's wrong. Include a score/streak counter. Use vanilla HTML, CSS, and JavaScript. The API key will be stored as an environment variable called ANTHROPIC_API_KEY."*

Then iterated with:
- Remove all AI/Claude branding from the visible UI
- Redesign from dark theme to a colorful, fun party quiz aesthetic

Commit history shows the actual iteration steps.
