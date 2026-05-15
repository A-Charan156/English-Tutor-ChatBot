import { exec } from "child_process";
import cors from "cors";
import express from "express";
import { promises as fs } from "fs";
import fetch from "node-fetch";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3000;

// Real-time lip sync generator based on phonemes
const generateLipSyncFromText = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const mouthCues = [];
  let currentTime = 0;

  // Phoneme mapping for more accurate lip sync
  const phonemeMap = {
    // Closed lips (B, M, P)
    'b': 'B', 'm': 'B', 'p': 'B',
    // Wide open (A, O)
    'a': 'A', 'o': 'A', 'aw': 'A', 'au': 'A',
    // Smile (E, I, Y)
    'e': 'E', 'i': 'E', 'y': 'E', 'ee': 'E',
    // Round lips (U, W, OO)
    'u': 'U', 'w': 'U', 'oo': 'U',
    // F, V sounds
    'f': 'F', 'v': 'F',
    // TH sounds
    'th': 'D',
    // Rest position
    'default': 'X'
  };

  words.forEach(word => {
    const duration = Math.max(word.length * 0.08, 0.3); // Word duration

    // Simple phoneme breakdown (you can make this more sophisticated)
    const phonemes = word.split('').filter(char => /[a-z]/.test(char));

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

    currentTime += duration + 0.1; // Add pause between words
  });

  return {
    metadata: { duration: currentTime },
    mouthCues
  };
};

app.get("/", (req, res) => {
  res.send("Hello World! Using Ollama API with Real-time Lip Sync");
});

// Groq API call function
const callOllama = async (prompt) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 100, // Shorter responses for real-time
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API call failed:', error);
    throw error;
  }
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    const welcomeText = "Hello! I'm your English tutor. How can I help you learn English today?";
    return res.send({
      messages: [
        {
          text: welcomeText,
          facialExpression: "smile",
          animation: "Talking_1",
          lipsync: generateLipSyncFromText(welcomeText),
          audio: "" // We'll use browser TTS
        }
      ],
    });
  }

  try {
    const prompt = `As an English tutor, give a detailed conversational response to only if the query is regarding english subject and also if the user closes by saying bye,close the conversation or else say u dont know: "${userMessage}" (max 50 words)`;

    const ollamaResponse = await callOllama(prompt);

    console.log("Ollama response:", ollamaResponse);

    const cleanResponse = ollamaResponse.replace(/```json\s*|\s*```|{[\s\S]*?}/g, '').trim();
    const messageText = cleanResponse || getFallbackResponse(userMessage);

    // Generate real-time lip sync
    const lipsync = generateLipSyncFromText(messageText);

    const messages = [{
      text: messageText,
      facialExpression: "smile",
      animation: "Talking_1",
      lipsync: lipsync,
      audio: "" // Using browser TTS instead of files
    }];

    res.send({ messages });

  } catch (error) {
    console.error("API error:", error);

    const fallbackText = getFallbackResponse(userMessage);
    const lipsync = generateLipSyncFromText(fallbackText);

    res.send({
      messages: [{
        text: fallbackText,
        facialExpression: "smile",
        animation: "Talking_1",
        lipsync: lipsync
      }]
    });
  }
});

// Fallback response generator
const getFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your English tutor. How can I help you learn English today?";
  }
  else if (lowerMessage.includes('grammar')) {
    return "I'd be happy to help with grammar! Could you give me a specific example?";
  }
  else if (lowerMessage.includes('vocabulary')) {
    return "Let's expand your vocabulary! What words interest you?";
  }
  else if (lowerMessage.includes('pronunciation')) {
    return "Pronunciation practice is important! What words would you like to practice?";
  }
  else {
    return "That's interesting! I can help with grammar, vocabulary, or pronunciation. What would you like to focus on?";
  }
};

app.listen(port, () => {
  console.log(`🎤 Real-time English Tutor backend running on port ${port}`);
});