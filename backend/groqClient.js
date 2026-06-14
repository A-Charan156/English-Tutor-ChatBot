import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.error("Error: GROQ_API_KEY is not set. Create backend/.env with GROQ_API_KEY=your_groq_api_key_here");
  process.exit(1);
}

export const sanitizeResponse = (rawResponse) => {
  if (!rawResponse) return "";
  return rawResponse
    .replace(/```(?:json)?\s*/g, "")
    .replace(/\s*```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^[\s\t\n\r]*[-*+]>?\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

export const callGroqChat = async (messages, options = {}) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'llama-3.3-70b-versatile',
      messages,
      temperature: options.temperature ?? 0.7,
      top_p: 1,
      max_completion_tokens: options.maxTokens || 300,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    })
  });

  if (!response.ok) {
    throw new Error("Groq API error: " + response.statusText);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  return sanitizeResponse(rawText);
};

// Dynamically figure out what topic the user is asking about
export const extractTopic = async (message) => {
  const prompt = 'Identify the main English grammar or vocabulary topic in this message.\nReply with ONLY a short topic name, 2-4 words, lowercase, no punctuation, no explanation.\n\nMessage: "' + message + '"';

  const result = await callGroqChat([
    { role: "system", content: "You extract topic names only. Reply with ONLY the topic name, nothing else." },
    { role: "user", content: prompt }
  ], { model: "llama-3.1-8b-instant", temperature: 0, maxTokens: 15 });

  return result.replace(/[."'`]/g, "").toLowerCase().trim();
};

// Generate study notes for any topic
export const generateTopicNotes = async (topic) => {
  const prompt = 'Write detailed study notes about "' + topic + '" for English language learners.\nStructure the notes using section headings that start with "## ".\nInclude a clear definition and 1-2 examples in each section.\nReturn plain text only, no markdown bold or italics, no bullet symbols.';

  return await callGroqChat([
    { role: "system", content: "You are an expert English grammar teacher creating study notes." },
    { role: "user", content: prompt }
  ], { temperature: 0.5, maxTokens: 800 });
};