// API route for fetching car models for a specific make
const API_NINJAS_KEY = process.env.API_NINJAS_KEY
const API_NINJAS_URL = "https://api.api-ninjas.com/v1/carmodels"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { make } = req.query

    if (!make) {
      return res.status(400).json({ error: "Make parameter is required" })
    }

    const response = await fetch(`${API_NINJAS_URL}?make=${make}`, {
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
    console.error("Car models API error:", error)
    res.status(500).json({
      error: "Failed to fetch car models",
      details: error.message,
    })
  }
}
