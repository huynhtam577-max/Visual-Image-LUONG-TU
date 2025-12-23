import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;
let lastSourceIndex = 0;
let lastPromptIndex = 0;

/**
 * Initializes the chat session and processes the first batch of script.
 */
export const initializeAndGenerate = async (
  apiKey: string,
  theme: string,
  script: string,
  template: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Reset counters
  lastSourceIndex = 0;
  lastPromptIndex = 0;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      temperature: 0.7,
      systemInstruction: `You are an expert Visual Prompt Director. 
      Your task is to take a Video Script and a Visual Prompt Template, and generate a specific output format containing "Source Context" and "Prompts".
      
      CRITICAL RULES:
      1. "Source Context" MUST be an EXACT VERBATIM EXCERPT from the provided "Script Content". Do NOT rephrase, summarize, or hallucinate text that is not in the script.
      2. Strictly follow the user's requested output format.
      3. Do not include commentary, conversational filler, or Markdown formatting like bolding headers unless the template asks for it.
      4. Maintain continuous numbering for "Source Context" and "Prompt" across multiple interactions.
      5. If the previous context ended at N, the next one starts at N+1.
      `,
    },
  });

  // Construct the initial prompt by following the user's specific replacement logic
  const initialPrompt = `
    I have a "Prompt Visual Image" template and a "Script Content".
    
    PLEASE PERFORM THE FOLLOWING ACTIONS:
    1. Take the [Theme: YYYYYYYYYY] section in the template below and replace YYYYYYYYYY with: "${theme}".
    2. Take the [Paste Script] section in the template below and replace it with the "SCRIPT CONTENT" provided below.
    3. Generate the output based on the logic inside the "Prompt Visual Image" file.

    --- "PROMPT VISUAL IMAGE" TEMPLATE START ---
    ${template}
    --- "PROMPT VISUAL IMAGE" TEMPLATE END ---

    --- SCRIPT CONTENT START ---
    ${script}
    --- SCRIPT CONTENT END ---

    OUTPUT FORMAT REQUIREMENTS:
    Source Context:
    Source Context 1: [Exact text copy-pasted from Script]
    Source Context 2: [Exact text copy-pasted from Script]

    Prompt:
    Prompt 1: ...
    Prompt 2: ...

    IMPORTANT: ensure every "Source Context" is a direct copy-paste from the "SCRIPT CONTENT" provided above.
    (List only the prompts. No commentary, no spacing between lines.)
  `;

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message: initialPrompt });
    const text = response.text || "";
    updateCountersFromText(text);
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Handles subsequent script chunks in the continuous flow.
 */
export const continueGeneration = async (newScript: string): Promise<string> => {
  if (!chatSession) throw new Error("Chat session not initialized");

  const prompt = `
    Here is the NEW SCRIPT CONTENT to continue the story:
    
    --- NEW SCRIPT START ---
    ${newScript}
    --- NEW SCRIPT END ---

    INSTRUCTIONS:
    1. Continue generating Source Context and Visual Prompts for this new script section based on the previous "Prompt Visual Image" template logic.
    2. IMPORTANT: "Source Context" MUST be exactly extracted (copy-paste) from the new script provided above.
    3. IMPORTANT: Verify the numbering. 
       - The last Source Context index was likely around ${lastSourceIndex}. The new one MUST start at ${lastSourceIndex + 1}.
       - The last Prompt index was likely around ${lastPromptIndex}. The new one MUST start at ${lastPromptIndex + 1}.
    4. Keep the same strict Output Format.
  `;

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message: prompt });
    const text = response.text || "";
    updateCountersFromText(text);
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Helper to parse the text and find the highest number used for Context and Prompts
 * to help the LLM keep track in the next turn.
 */
function updateCountersFromText(text: string) {
  // Regex to find "Source Context X:" or "Prompt X:"
  const sourceContextMatches = text.matchAll(/Source Context (\d+):/gi);
  const promptMatches = text.matchAll(/Prompt (\d+):/gi);

  for (const match of sourceContextMatches) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > lastSourceIndex) lastSourceIndex = num;
  }

  for (const match of promptMatches) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > lastPromptIndex) lastPromptIndex = num;
  }
}
