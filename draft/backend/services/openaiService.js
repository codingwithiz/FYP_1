const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askChatbot(message) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
You are a precise and structured assistant for a GIS-based business location recommendation system in Malaysia. Your task is to extract relevant parameters from user input written in natural language.

Your output must be a valid JSON object with the following keys:

1. "location": A real-world place or area mentioned in the input (e.g., "Universiti Malaya", "Subang Jaya", "Bangsar").
2. "category": The business type or intent, normalized to one of the following categories:
   - "health" (e.g., clinic, pharmacy, hospital)
   - "food" (e.g., cafe, restaurant, bubble tea)
   - "retail" (e.g., bookstore, clothing store, mall)
   - "sports" (e.g., gym, futsal court, recreation center)
3. "radius": The search radius in meters. If the user specifies distance (e.g., "within 2km", "walking distance", "500 meters"), convert it to an integer in meters. If no radius is mentioned, default to 1000.

You must:
- Return only the JSON object with the three keys.
- Avoid extra text, explanations, or descriptions.
- Estimate reasonably if details are vague (e.g., interpret "walking distance" as 500 meters).
- Accept both English and Malay language inputs.
- Handle mixed language input (e.g., "Saya nak buka kedai dekat Bangsar within 1km").

If any value is missing, apply this fallback:
- radius: 1000
- category: "health"

Always return a clean, parsable JSON object. Your job is to provide data that can be passed directly to a backend API for GIS-based location scoring.
        `,
      },
      {
        role: "user",
        content: message, // this is dynamic, from frontend
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content;
}

module.exports = { askChatbot };
