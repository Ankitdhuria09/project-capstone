// src/utils/aiParser.js
export async function aiParseTransaction(input, apiKey) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat-v3", // pick your preferred model from OpenRouter
      messages: [
        {
          role: "system",
          content: "You are a financial assistant. Extract transaction details from user text and return valid JSON with keys: type (income/expense/investment/goal/group), category, amount, description, date (ISO).",
        },
        {
          role: "user",
          content: input,
        },
      ],
      temperature: 0,
    }),
  });

  const data = await res.json();

  try {
    const json = JSON.parse(data.choices[0].message.content);
    return json;
  } catch (err) {
    console.error("AI parse error:", err, data);
    return null;
  }
}
