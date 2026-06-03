import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router: IRouter = Router();

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

router.post("/quiz/generate", async (req, res): Promise<void> => {
  const { topic } = req.body as { topic?: string };

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
    return;
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are the host of "Wrong Answers Only" — a quiz show where EVERY answer is hilariously, confidently wrong. There is no correct answer. All four options should sound plausible and be stated with total confidence, but all of them are wrong.

Topic: ${topic.trim()}

Generate one quiz question about this topic. The question should be a straightforward factual question that has a well-known correct answer in real life, but you will NOT provide the correct answer. Instead provide 4 wrong answers that:
- Each sounds plausible and confident
- Covers different kinds of "wrong" (slightly off, wildly off, technically adjacent, etc.)
- Are funny or absurd in different ways

Respond ONLY with valid JSON in this exact format:
{
  "question": "the question text here",
  "answers": ["wrong answer 1", "wrong answer 2", "wrong answer 3", "wrong answer 4"]
}

No markdown, no explanation, just the JSON object.`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    let parsed: { question: string; answers: string[] };
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      req.log.error({ text }, "Failed to parse Claude response as JSON");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    if (
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.answers) ||
      parsed.answers.length !== 4
    ) {
      res.status(500).json({ error: "Unexpected AI response shape" });
      return;
    }

    res.json(parsed);
  } catch (err: unknown) {
    req.log.error({ err }, "Claude API error in /quiz/generate");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `AI request failed: ${message}` });
  }
});

router.post("/quiz/explain", async (req, res): Promise<void> => {
  const { topic, question, answer } = req.body as {
    topic?: string;
    question?: string;
    answer?: string;
  };

  if (
    !topic || typeof topic !== "string" ||
    !question || typeof question !== "string" ||
    !answer || typeof answer !== "string"
  ) {
    res.status(400).json({ error: "topic, question, and answer are required" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: "ANTHROPIC_API_KEY is not configured on the server" });
    return;
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are the host of "Wrong Answers Only" quiz. The player just picked a hilariously wrong answer.

Topic: ${topic.trim()}
Question: ${question.trim()}
The answer they picked: ${answer.trim()}

Write a SHORT, witty, slightly snarky explanation of why this answer is wrong (2-3 sentences max). Be playful and funny. You can mention what the actual correct answer is as part of the joke. Don't be mean — it's all in good fun.

Respond with just the explanation text, no JSON, no markdown.`,
        },
      ],
    });

    const explanation =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    res.json({ explanation });
  } catch (err: unknown) {
    req.log.error({ err }, "Claude API error in /quiz/explain");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `AI request failed: ${message}` });
  }
});

export default router;
