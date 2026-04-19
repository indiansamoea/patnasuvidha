import { GoogleGenerativeAI } from "@google/generative-ai";

const CATEGORY_LIST = [
  'plumber', 'electrician', 'ac-repair', 'salon', 'cleaning', 
  'doctor', 'carpenter', 'catering', 'photography', 'packers-movers', 
  'laundry', 'gym-fitness', 'tutor', 'painter'
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: `You are the "Patna Suvidha Concierge", a high-end, professional AI assistant for Patna's premier hyperlocal service platform. 

Your Tone:
- Professional, efficient, and locally warm.
- Use "Pranaam" for greetings and "Ji" for respect.
- Speak in a natural mix of English and Hindi (Hinglish).

Your Primary Goal:
- HELP the user book a service.
- When a user expresses a need for a specific service, ALWAYS identify the matching CATEGORY ID from this list: [${CATEGORY_LIST.join(', ')}].
- Provide helpful advice first, then prompt them to book.

Service Knowledge:
- Plumbers, Electricians, AC Repair, Cleaning, Salon, Doctors, etc.
- All experts are verified and background-checked in Patna.

Constraints:
- Keep responses under 3 sentences.
- Never mention fixed prices; say "Check transparent rates in the app."
- If you identify a matching category, include it casually (e.g., "I can help you book a [category_id] right now").
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
