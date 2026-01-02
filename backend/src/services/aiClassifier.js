const OpenAI = require("openai");

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classify incident severity using OpenAI GPT
 * @param {string} title - Incident title
 * @param {string} description - Incident description
 * @returns {Promise<string>} - Severity level: 'low', 'medium', or 'high'
 */
async function classifyIncidentSeverity(title, description) {
  // If no API key, fall back to keyword-based classification
  if (!process.env.OPENAI_API_KEY) {
    console.log("⚠️ No OpenAI API key found, using keyword-based classification");
    return keywordBasedClassification(title, description);
  }

  try {
    const prompt = `You are an emergency dispatch AI assistant. Classify the following incident into one of three severity levels: "low", "medium", or "high".

Guidelines:
- HIGH: Life-threatening situations, active fires, serious accidents, violent crimes in progress, medical emergencies (heart attack, stroke, severe bleeding)
- MEDIUM: Property damage, minor injuries, non-violent crimes, traffic accidents without serious injuries, small fires contained
- LOW: Noise complaints, minor disputes, non-emergency medical transport, lost property, minor traffic issues

Incident Title: ${title}
Incident Description: ${description}

Respond with ONLY one word: "low", "medium", or "high"`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an emergency incident severity classifier. Respond with only one word: low, medium, or high.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const severity = response.choices[0].message.content.trim().toLowerCase();
    
    // Validate response
    if (["low", "medium", "high"].includes(severity)) {
      console.log(`🤖 AI classified incident as: ${severity}`);
      return severity;
    }
    
    // Fallback if AI returns unexpected value
    console.log(`⚠️ Unexpected AI response: ${severity}, using keyword-based classification`);
    return keywordBasedClassification(title, description);
    
  } catch (error) {
    console.error("❌ OpenAI API error:", error.message);
    // Fallback to keyword-based classification
    return keywordBasedClassification(title, description);
  }
}

/**
 * Keyword-based classification as fallback
 */
function keywordBasedClassification(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  const highKeywords = [
    "fire", "explosion", "shooting", "stabbing", "heart attack", "stroke",
    "unconscious", "not breathing", "severe bleeding", "trapped", "collapse",
    "active shooter", "hostage", "bomb", "terrorist", "drowning", "electrocution"
  ];
  
  const mediumKeywords = [
    "accident", "crash", "injury", "assault", "theft", "burglary", "smoke",
    "gas leak", "flood", "broken bone", "fall", "fight", "domestic", "robbery"
  ];
  
  // Check for high severity keywords
  if (highKeywords.some(keyword => text.includes(keyword))) {
    return "high";
  }
  
  // Check for medium severity keywords
  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return "medium";
  }
  
  // Default to low
  return "low";
}

module.exports = {
  classifyIncidentSeverity,
  keywordBasedClassification,
};
