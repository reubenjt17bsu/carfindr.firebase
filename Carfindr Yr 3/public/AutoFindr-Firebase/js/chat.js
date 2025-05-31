const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Car series knowledge base for context
const carKnowledgeBase = `
Elite Car Series Information:

MODELS:
1. Elite GT - Flagship grand tourer, luxury + performance, V8 Twin-Turbo, 650 HP
2. Elite Sport - Pure performance, racing-inspired, 0-60 in 3.2 seconds, top speed 205 mph
3. Elite Luxury - Premium comfort, executive-class features, hand-stitched leather
4. Elite Hybrid - Sustainable performance, hybrid powertrain, eco-friendly technology

SPECIFICATIONS:
- Engine: V8 Twin-Turbo, 650 HP, 750 lb-ft torque
- Performance: 0-60 mph in 3.2 seconds, top speed 205 mph
- Dimensions: Length 195.5", Width 76.8", Height 54.2", Wheelbase 115.7"
- Weight: 3,850 lbs
- Technology: 12.3" touchscreen, 15-speaker sound system, Level 2 autonomous driving
- Connectivity: 5G, WiFi hotspot, real-time navigation

FEATURES:
- Advanced LED matrix lighting
- Carbon fiber details
- Premium materials and craftsmanship
- Racing-inspired design
- Hybrid technology available
- Advanced safety systems

YEARS:
- 2024: Latest generation with AI integration
- 2023: Hybrid technology, enhanced safety
- 2022: Performance upgrades, new design
- 2021: Digital transformation, connected services
- 2020: Series launch, foundation models

COMPANY:
- Founded with vision for ultimate driving experience
- 30+ years of automotive innovation
- Commitment to excellence in design and manufacturing
- Focus on luxury, performance, and innovation
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create context-aware prompt
    const prompt = `You are an AI assistant for Elite Car Series, a luxury automotive company. Use the following information to answer customer questions accurately and helpfully:

${carKnowledgeBase}

Customer Question: ${message}

Please provide a helpful, accurate response about Elite Car Series. If the question is outside the scope of car information, politely redirect to car-related topics. Be friendly, professional, and knowledgeable.`;

    const response = await fetch(`${h}?key=${AIzaSyDE_mYHlYmkjGkm0UhK5gbiSx2BXrzHAiY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Sorry, I encountered an error. Please try again later.',
      details: error.message 
    });
  }
}