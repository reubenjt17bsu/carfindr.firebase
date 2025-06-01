// API route for fetching real car data from API Ninjas
const API_NINJAS_KEY = process.env.API_NINJAS_KEY
const API_NINJAS_URL = "https://api.api-ninjas.com/v1/cars"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { make, model, fuel_type, year, limit = 10 } = req.query

    // Build query parameters
    const params = new URLSearchParams()
    if (make) params.append("make", make)
    if (model) params.append("model", model)
    if (fuel_type) params.append("fuel_type", fuel_type)
    if (year) params.append("year", year)
    params.append("limit", limit)

    const response = await fetch(`${API_NINJAS_URL}?${params}`, {
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
    console.error("Cars API error:", error)
    res.status(500).json({
      error: "Failed to fetch car data",
      details: error.message,
    })
  }
}
