// Enhanced API route for comprehensive automotive chatbot
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

// Comprehensive automotive knowledge base
const automotiveKnowledgeBase = `
ELITE CAR SERIES INFORMATION:
- Elite GT: Flagship grand tourer, V8 Twin-Turbo, 650 HP, 0-60 in 3.2s, top speed 205 mph
- Elite Sport: Pure performance, racing-inspired, enhanced aerodynamics, track-tuned suspension
- Elite Luxury: Premium comfort, hand-stitched leather, executive-class features, noise cancellation
- Elite Hybrid: Sustainable performance, hybrid powertrain, 30% emission reduction

COMPREHENSIVE AUTOMOTIVE EXPERTISE:
- Car specifications, performance, and detailed comparisons
- Automotive technology, innovations, and future trends
- Car buying advice, financing options, and recommendations
- Maintenance tips, troubleshooting, and repair guidance
- Industry news, market trends, and manufacturer updates
- Electric vehicles, hybrid technology, and sustainability
- Racing, motorsports, and performance modifications
- Car history, heritage, and classic vehicles
- Safety features, ratings, and accident prevention
- Fuel efficiency, environmental impact, and eco-friendly options
- Car financing, insurance, leasing vs buying decisions
- Driving tips, techniques, and road safety

WEBSITE NAVIGATION:
- Test Drive: Book test drives for Elite models or any vehicle
- Gallery: Photo gallery with exterior, interior, engine, and detail shots
- Specifications: Technical details and performance data
- Models: Elite car lineup and model comparisons
- Contact: Get in touch with our team
- About: Company heritage and innovation story
`

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    // Create comprehensive automotive prompt
    const prompt = `You are an advanced automotive AI assistant with comprehensive knowledge about cars, the automotive industry, and Elite Car Series. You can help with:

${automotiveKnowledgeBase}

CAPABILITIES:
1. Answer questions about any car make, model, year, or specifications
2. Provide detailed vehicle comparisons and recommendations
3. Explain automotive technology, features, and innovations
4. Give maintenance advice, troubleshooting, and repair guidance
5. Discuss industry trends, market analysis, and future developments
6. Help with car buying decisions, financing, and ownership costs
7. Explain technical specifications and performance metrics
8. Provide safety information and efficiency recommendations
9. Discuss Elite Car Series models in detail
10. Navigate website sections and features

Customer Question: ${message}

Instructions:
- If the question is about Elite Car Series, prioritize that information
- For general automotive questions, provide comprehensive, accurate knowledge
- Be helpful, professional, and knowledgeable about all car topics
- If you need to redirect to website sections, mention the relevant section
- For test drives, direct users to the Test Drive section
- Always provide detailed, informative responses about automotive topics
- If asked about non-automotive topics, politely redirect to car-related subjects
- Use your extensive automotive knowledge to provide expert-level responses

Please provide a helpful, detailed response:`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates[0].content.parts[0].text

    res.status(200).json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API error:", error)
    res.status(500).json({
      error: "Sorry, I encountered an error. Please try again later.",
      details: error.message,
    })
  }
}
