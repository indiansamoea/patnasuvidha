import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Construct the System Prompt with Context
    const systemPrompt = `You are the Patna Suvidha local assistant.
Your goal is to help users find services and businesses in Patna, Bihar.
Answer the user's query strictly using the following business data provided. 
If the requested service or business is not in the data, politely inform them that you couldn't find it in our current directory but they can browse the categories.

BUSINESS DATA:
${JSON.stringify(context, null, 2)}

INSTRUCTIONS:
- Be polite and helpful.
- Reply in the same language as the user (English/Hindi).
- Keep responses concise and mobile-friendly.
- If a business is found, mention its name, category, and address if available.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am the Patna Suvidha assistant. I will use the provided data to help users find services in Patna." }] },
        ...(history || []).map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: "Failed to connect to AI Assistant. Please try again later." });
  }
}
