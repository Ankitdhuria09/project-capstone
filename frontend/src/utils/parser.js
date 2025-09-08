export function parseTransactionText(input, userId) {
  if (!input?.trim()) {
    return null;
  }

  const text = input.toLowerCase();

  // Extract amount (first number in text)
  const amountMatch = text.match(/(\d+)/);
  const amount = amountMatch ? parseInt(amountMatch[1]) : null;

  if (!amount) {
    return null; // amount is required
  }

  let result = {
    id: Date.now(), // temporary ID
    userId,
    description: input.trim(),
    amount,
    category: "general",
    type: "expense", // default assumption
    date: new Date().toISOString()
  };

  // ---- PARSING RULES ----
  if (/salary|earned|credited|received/.test(text)) {
    result.type = "income";
    result.category = "salary";
  } 
  else if (/bonus|profit|interest/.test(text)) {
    result.type = "income";
    result.category = "other income";
  } 
  else if (/grocery|grocer|food/.test(text)) {
    result.type = "expense";
    result.category = "groceries";
  }
  else if (/petrol|fuel|gas/.test(text)) {
    result.type = "expense";
    result.category = "fuel";
  }
  else if (/dinner|lunch|restaurant|coffee/.test(text)) {
    result.type = "expense";
    result.category = "food & dining";
  }
  else if (/rent|house|flat/.test(text)) {
    result.type = "expense";
    result.category = "rent";
  }
  else if (/invested|stocks|mutual fund|shares|gold/.test(text)) {
    result.type = "expense"; // fallback, since schema only supports income/expense
    result.category = "investment";
  }
  else if (/goal|save for|want to buy/.test(text)) {
    result.type = "expense";
    result.category = "goal";
  }

  return result;
}