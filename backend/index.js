import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { retrieveContext, getOrCreateTopicContent, listKnownTopics } from "./rag.js";
import { callGroqChat, extractTopic } from "./groqClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

const generateLipSyncFromText = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const mouthCues = [];
  let currentTime = 0;

  const phonemeMap = {
    'b': 'B', 'm': 'B', 'p': 'B',
    'a': 'A', 'o': 'A', 'aw': 'A', 'au': 'A',
    'e': 'E', 'i': 'E', 'y': 'E', 'ee': 'E',
    'u': 'U', 'w': 'U', 'oo': 'U',
    'f': 'F', 'v': 'F', 'ph': 'F',
    'th': 'H',
    'default': 'X'
  };

  const digraphs = ['th', 'aw', 'au', 'ee', 'oo', 'ph'];

  words.forEach(word => {
    const duration = Math.max(word.length * 0.08, 0.3);

    const phonemes = [];
    let i = 0;
    while (i < word.length) {
      const pair = word.slice(i, i + 2);
      if (digraphs.includes(pair)) {
        phonemes.push(pair);
        i += 2;
      } else if (/[a-z]/.test(word[i])) {
        phonemes.push(word[i]);
        i += 1;
      } else {
        i += 1;
      }
    }

    if (phonemes.length > 0) {
      const segmentDuration = duration / phonemes.length;

      phonemes.forEach((phoneme, index) => {
        const phonemeType = phonemeMap[phoneme] || phonemeMap.default;
        mouthCues.push({
          start: currentTime + (index * segmentDuration),
          end: currentTime + ((index + 1) * segmentDuration),
          value: phonemeType
        });
      });
    }

    currentTime += duration + 0.1;
  });

  return {
    metadata: { duration: currentTime },
    mouthCues
  };
};

const systemPrompt = "You are a friendly English tutor speaking simply to a beginner learner.\nAnswer each question in 2-3 short sentences, using clear everyday English and one simple example.\nReturn plain text only. Do not use markdown, asterisks, bold, bullets, headings, or list formatting.\nDo not repeat the same answer for different questions.\nIf the question is not about English learning, politely ask the user to ask about English grammar, vocabulary, pronunciation, or usage.";

const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your English tutor. How can I help you learn English today?";
  } else if (lowerMessage.includes('grammar')) {
    return "I'd be happy to help with grammar! Could you give me a specific example?";
  } else if (lowerMessage.includes('vocabulary')) {
    return "Let's expand your vocabulary! What words interest you?";
  } else if (lowerMessage.includes('pronunciation')) {
    return "Pronunciation practice is important! What words would you like to practice?";
  } else {
    return "That's interesting! I can help with grammar, vocabulary, or pronunciation. What would you like to focus on?";
  }
};

app.get("/", (req, res) => {
  res.send("English Tutor backend running with dynamic self-building RAG (Groq)");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    const welcomeText = "Hello! I'm your English tutor. How can I help you learn English today?";
    return res.send({
      messages: [{
        text: welcomeText,
        facialExpression: "smile",
        animation: "Talking_1",
        lipsync: generateLipSyncFromText(welcomeText),
        audio: ""
      }],
    });
  }

  try {
    // Step 1: Dynamically detect the topic using Groq
    const topic = await extractTopic(userMessage);
    console.log("Detected topic:", topic);

    // Step 2: RAG - retrieve or build context for this topic
    let context = retrieveContext(topic);
    const contentForContext = context ? context.content : await getOrCreateTopicContent(topic);

    // Prompt updated to remove any mention of PDFs
    const userPrompt = "Context notes:\n" + contentForContext + "\n\nQuestion: \"" + userMessage + "\"\n\nUsing the context notes above, answer the learner's question clearly with one simple example.";

    const answer = await callGroqChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const messageText = (answer && answer.length > 0) ? answer : getFallbackResponse(userMessage);

    res.send({
      messages: [{
        text: messageText,
        facialExpression: "smile",
        animation: "Talking_1",
        lipsync: generateLipSyncFromText(messageText),
        audio: ""
      }]
    });

  } catch (error) {
    console.error("API error:", error);
    const fallbackText = getFallbackResponse(userMessage);
    res.send({
      messages: [{
        text: fallbackText,
        facialExpression: "smile",
        animation: "Talking_1",
        lipsync: generateLipSyncFromText(fallbackText)
      }]
    });
  }
});

app.get("/topics", (req, res) => {
  res.send({ topics: listKnownTopics() });
});

app.get('/health', (req, res) => {
  res.send({ status: 'ok' });
});

app.listen(port, () => {
  console.log("English Tutor backend running on port " + port);
});