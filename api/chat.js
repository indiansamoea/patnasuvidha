import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `You are the "Patna Suvidha Assistant", a friendly, professional, and deeply knowledgeable local concierge for the city of Patna, Bihar. 

Your goals:
1. Help users find and book local services (plumbers, electricians, salons, etc.) in Patna.
2. Be helpful, polite, and use local warmth (occasional "Pranaam" or "Ji" is appropriate).
3. Recommend specific businesses from the provided context. If a business is mentioned in the context that matches the user's needs, suggest it by name.
4. If no businesses in the context match, help them navigate the app's categories.
5. Keep answers concise and mobile-friendly.
6. Speak in the language the user is using (English or Hindi/Hinglish).

Context rules:
- You will receive a list of businesses as context.
- Use this context as your source of truth for available services.
- If asked about prices, say they vary and recommend booking and checking the specific service price in the app.
`
});

export default async function handler(req, res) {
  // CORS Headers
  const allowedOrigins = [
    'https://patnasuvidha.com',
    'https://www.patnasuvidha.com',
    'https://patnasuvidha.vercel.app',
    'http://localhost:5173'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
Context (Available businesses and services in Patna): 
${context || "No specific context provided. General Patna service query."}

User Message: ${message}

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({ 
      response: "Pranaam! Maaf kariye, hamara system abhi thoda aaram kar raha hai. Kripya thodi der baad fir se koshish karein. (The assistant is resting, please try again later.)" 
    });
  }
}
