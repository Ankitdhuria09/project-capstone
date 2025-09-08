export async function aiParseTransaction(input, apiKey) {
  if (!input?.trim()) {
    throw new Error("Input text is required");
  }
  if (!apiKey?.trim()) {
    throw new Error("API key is required");
  }

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small", // or "mistral-tiny" or "mistral-medium"
        messages: [
          {
            role: "system",
            content: "You are a financial assistant. Extract transaction details from user text and return ONLY valid JSON with keys: type (only income or expense), category, amount (as a number), description, date (ISO format). Do not include any extra text or markdown.",
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0,
        response_format: { "type": "json_object" }, // Force JSON output
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`API request failed: ${errorData.message || res.status}`);
    }

    const data = await res.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response structure");
    }

    try {
      const json = JSON.parse(data.choices[0].message.content);

      // Validate required fields
      if (!json.type || !json.category || !json.amount || !json.description) {
        throw new Error("Missing required fields in parsed transaction");
      }

      // Ensure amount is a number
      json.amount = Number(json.amount);
      if (isNaN(json.amount) || json.amount <= 0) {
        throw new Error("Invalid amount in parsed transaction");
      }

      // Validate type
      if (!["income", "expense"].includes(json.type)) {
        throw new Error(`Invalid transaction type: ${json.type}`);
      }

      // Add ID and date if missing
      json.id = json.id || Date.now();
      json.date = json.date || new Date().toISOString();

      return json;
    } catch (parseError) {
      console.error("JSON parse error:", parseError, data);
      throw new Error("Failed to parse AI response as valid JSON");
    }
  } catch (error) {
    console.error("AI parse error:", error);
    throw error;
  }
}
