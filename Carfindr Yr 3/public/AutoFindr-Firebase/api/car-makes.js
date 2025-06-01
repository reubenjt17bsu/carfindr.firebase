// API route for fetching car manufacturers
const API_NINJAS_KEY = process.env.API_NINJAS_KEY
const API_NINJAS_URL = "https://api.api-ninjas.com/v1/carmakes"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const response = await fetch(API_NINJAS_URL, {
      method: "GET",
      headers: {
        "X-Api-Key": API_NINJAS_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error("Car makes API error:", error)
    res.status(500).json({
      error: "Failed to fetch car makes",
      details: error.message,
    })
  }
}
