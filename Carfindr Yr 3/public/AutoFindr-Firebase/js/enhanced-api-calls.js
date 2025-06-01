// Enhanced API call functions with retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed:`, error.message)
      if (i === maxRetries - 1) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
    }
  }
}

// Declare carMakes, populateCarMakes, and displayCarResults
let carMakes = []
const populateCarMakes = () => {}
const displayCarResults = () => {}

// Enhanced loadCarMakes with error handling
async function loadCarMakes() {
  try {
    const response = await fetchWithRetry("/api/car-makes")
    carMakes = await response.json()
    populateCarMakes()

    // Show success message
    showNotification("Car manufacturers loaded successfully!", "success")
  } catch (error) {
    console.error("Error loading car makes:", error)
    showNotification("Failed to load car manufacturers. Please try again.", "error")

    // Fallback to popular makes
    carMakes = ["toyota", "honda", "ford", "chevrolet", "bmw", "mercedes-benz", "audi", "volkswagen"]
    populateCarMakes()
  }
}

// Enhanced searchCars with better error handling
async function searchCars() {
  const make = document.getElementById("car-make").value
  const model = document.getElementById("car-model").value
  const fuelType = document.getElementById("fuel-type").value
  const year = document.getElementById("car-year").value

  const loadingIndicator = document.getElementById("cars-loading")
  const resultsContainer = document.getElementById("cars-results")

  // Show loading
  loadingIndicator.style.display = "block"
  resultsContainer.innerHTML = ""

  try {
    const params = new URLSearchParams()
    if (make) params.append("make", make)
    if (model) params.append("model", model)
    if (fuelType) params.append("fuel_type", fuelType)
    if (year) params.append("year", year)
    params.append("limit", "20")

    const response = await fetchWithRetry(`/api/cars-data?${params}`)
    const cars = await response.json()

    displayCarResults(cars)
    showNotification(`Found ${cars.length} cars matching your criteria!`, "success")
  } catch (error) {
    console.error("Error searching cars:", error)
    resultsContainer.innerHTML = `
            <div class="error-message">
                <h3>🚗 Oops! Something went wrong</h3>
                <p>We're having trouble loading car data right now. This could be due to:</p>
                <ul>
                    <li>Temporary API issues</li>
                    <li>Network connectivity problems</li>
                    <li>High server load</li>
                </ul>
                <button onclick="searchCars()" class="retry-btn">Try Again</button>
                <p><small>If the problem persists, please contact our support team.</small></p>
            </div>
        `
    showNotification("Failed to search cars. Please try again.", "error")
  } finally {
    loadingIndicator.style.display = "none"
  }
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `

  document.body.appendChild(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 80px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    border-left: 4px solid #4CAF50;
    color: #2E7D32;
}

.notification.error {
    border-left: 4px solid #f44336;
    color: #C62828;
}

.notification.info {
    border-left: 4px solid #2196F3;
    color: #1565C0;
}

.notification button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.error-message {
    text-align: center;
    padding: 40px 20px;
    background: #fff5f5;
    border: 2px solid #fed7d7;
    border-radius: 15px;
    color: #c53030;
}

.error-message h3 {
    color: #c53030;
    margin-bottom: 20px;
}

.error-message ul {
    text-align: left;
    max-width: 300px;
    margin: 20px auto;
}

.retry-btn {
    background: #c53030 !important;
    margin-top: 20px;
}

.retry-btn:hover {
    background: #9c2626 !important;
}
`

// Add styles to head
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
