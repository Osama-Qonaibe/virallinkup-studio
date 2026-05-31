import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

function getModel(apiKey, endpoint) {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: 'gpt-4o-mini',
    temperature: 0.2,
    configuration: endpoint ? { baseURL: endpoint } : undefined,
  });
}

const SYSTEM_REFACTOR = `You are an expert code reviewer and refactoring assistant.
Return only the improved code without explanation unless asked.
Preserve the original language and style conventions.`;

const SYSTEM_EXPLAIN = `You are a senior developer explaining code clearly and concisely.
Focus on what the code does, potential issues, and improvement suggestions.`;

export async function refactorCode({ code, language, instruction, apiKey, endpoint }) {
  const model = getModel(apiKey, endpoint);
  const res = await model.invoke([
    new SystemMessage(SYSTEM_REFACTOR),
    new HumanMessage(`Language: ${language}\nInstruction: ${instruction || 'Refactor and improve this code'}\n\n${code}`),
  ]);
  return res.content;
}

export async function explainCode({ code, language, apiKey, endpoint }) {
  const model = getModel(apiKey, endpoint);
  const res = await model.invoke([
    new SystemMessage(SYSTEM_EXPLAIN),
    new HumanMessage(`Language: ${language}\n\n${code}`),
  ]);
  return res.content;
}

export async function completeCode({ prefix, suffix, language, apiKey, endpoint }) {
  const model = getModel(apiKey, endpoint);
  const res = await model.invoke([
    new SystemMessage(`Complete the code. Return only the missing part.`),
    new HumanMessage(`Language: ${language}\nPrefix:\n${prefix}\nSuffix:\n${suffix}`),
  ]);
  return res.content;
}
