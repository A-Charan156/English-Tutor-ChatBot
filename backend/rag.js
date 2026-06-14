import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateTopicNotes } from "./groqClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const kbDir = path.join(__dirname, "knowledge_base");
const kbPath = path.join(kbDir, "topics.json");

if (!fs.existsSync(kbDir)) {
  fs.mkdirSync(kbDir, { recursive: true });
}

export let knowledgeBase = {};
if (fs.existsSync(kbPath)) {
  knowledgeBase = JSON.parse(fs.readFileSync(kbPath, "utf-8"));
}

const saveKnowledgeBase = () => {
  fs.writeFileSync(kbPath, JSON.stringify(knowledgeBase, null, 2));
};

export function retrieveContext(topic) {
  if (topic && knowledgeBase[topic]) {
    return { topic, content: knowledgeBase[topic] };
  }
  return null;
}

export async function getOrCreateTopicContent(topic) {
  if (knowledgeBase[topic]) {
    console.log("Retrieved from knowledge base:", topic);
    return knowledgeBase[topic];
  }
  console.log("New topic, generating with Groq:", topic);
  const notes = await generateTopicNotes(topic);
  knowledgeBase[topic] = notes;
  saveKnowledgeBase();
  return notes;
}

export function listKnownTopics() {
  return Object.keys(knowledgeBase);
}