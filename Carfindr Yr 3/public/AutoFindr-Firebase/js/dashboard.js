// Dashboard JavaScript for dashboard.html (Main website page)

const loadingScreen = document.getElementById("loading-screen")

// Show loading screen initially
if (loadingScreen) {
  loadingScreen.style.display = "flex"
}

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth()
const db = firebase.firestore()

// Authentication guard - check if user is logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, initialize dashboard
    console.log("User is signed in:", user.displayName || user.email)
    initializeDashboard(user)
  } else {
    // No user is signed in, redirect to login
    console.log("No user is signed in, redirecting to login...")
    window.location.href = "index.html"
  }
})

// Initialize dashboard for authenticated user
function initializeDashboard(user) {
  // Hide loading screen
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.display = "none"
    }
  }, 1000)

  // Update UI for authenticated user
  updateUIForAuthenticatedUser(user)

  // Initialize other functionality
  initializeCarDatabase()
  initializeTestDriveFeatures()
  initializeChatbot()

  // Load additional scripts
  loadEmailService()
  loadTestDriveBooking()
}

// Update UI for authenticated users
function updateUIForAuthenticatedUser(user) {
  // Update welcome message
  const heroTitle = document.querySelector(".hero-content h1")
  if (heroTitle) {
    heroTitle.textContent = `Welcome back, ${user.displayName || user.email.split("@")[0]}!`
  }

  // Add user profile to navigation
  const navbarContent = document.querySelector(".navbar-content")
  if (navbarContent && !document.getElementById("user-profile")) {
    const profileElement = document.createElement("div")
    profileElement.id = "user-profile"
    profileElement.className = "user-profile"

    // Create profile content
    profileElement.innerHTML = `
            <div class="profile-dropdown">
                <div class="profile-trigger" onclick="toggleProfileMenu()">
                    ${
                      user.photoURL
                        ? `<img src="${user.photoURL}" alt="${user.displayName}" class="profile-image">`
                        : `<div class="profile-initial">${(user.displayName || user.email)[0].toUpperCase()}</div>`
                    }
                    <span class="profile-name">${user.displayName || user.email.split("@")[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="profile-menu" id="profile-menu">
                    <a href="#" onclick="showUserProfile()">
                        <i class="fas fa-user"></i> My Profile
                    </a>
                    <a href="#" onclick="showUserFavorites()">
                        <i class="fas fa-heart"></i> Favorites
                    </a>
                    <a href="#" onclick="showUserTestDrives()">
                        <i class="fas fa-car"></i> My Test Drives
                    </a>
                    <a href="#" onclick="showUserSettings()">
                        <i class="fas fa-cog"></i> Settings
                    </a>
                    <a href="#" onclick="signOut()" class="logout-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `

    navbarContent.appendChild(profileElement)
  }

  // Enable authenticated features
  enableAuthenticatedFeatures()
}

// Toggle profile menu
function toggleProfileMenu() {
  const profileMenu = document.getElementById("profile-menu")
  if (profileMenu) {
    profileMenu.classList.toggle("active")
  }
}

// Close profile menu when clicking outside
document.addEventListener("click", (e) => {
  const profileDropdown = document.querySelector(".profile-dropdown")
  const profileMenu = document.getElementById("profile-menu")

  if (profileDropdown && !profileDropdown.contains(e.target)) {
    if (profileMenu && profileMenu.classList.contains("active")) {
      profileMenu.classList.remove("active")
    }
  }
})

// Profile menu functions
function showUserProfile() {
  alert("Profile page coming soon!")
  toggleProfileMenu()
}

function showUserFavorites() {
  alert("Favorites page coming soon!")
  toggleProfileMenu()
}

function showUserTestDrives() {
  alert("Test drives page coming soon!")
  toggleProfileMenu()
}

function showUserSettings() {
  alert("Settings page coming soon!")
  toggleProfileMenu()
}

// Sign out function
function signOut() {
  if (confirm("Are you sure you want to sign out?")) {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out successfully")
        window.location.href = "index.html"
      })
      .catch((error) => {
        console.error("Error signing out:", error)
        alert("Error signing out. Please try again.")
      })
  }
  toggleProfileMenu()
}

// Enable features for authenticated users
function enableAuthenticatedFeatures() {
  // Enable test drive booking
  const testDriveButtons = document.querySelectorAll(".elite-model-option, .test-drive-car-option")
  testDriveButtons.forEach((button) => {
    button.style.pointerEvents = "auto"
    button.style.opacity = "1"
  })

  // Enable favorites functionality
  addFavoriteButtons()

  // Enable personalized recommendations
  loadPersonalizedRecommendations()
}

// Add favorite buttons to car cards
function addFavoriteButtons() {
  const carCards = document.querySelectorAll(".car-result-card, .model-card")
  carCards.forEach((card) => {
    if (!card.querySelector(".favorite-btn")) {
      const favoriteBtn = document.createElement("button")
      favoriteBtn.className = "favorite-btn"
      favoriteBtn.innerHTML = '<i class="far fa-heart"></i>'
      favoriteBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleFavorite(card, favoriteBtn)
      })
      card.style.position = "relative"
      card.appendChild(favoriteBtn)
    }
  })
}

// Toggle favorite status
function toggleFavorite(card, button) {
  const user = auth.currentUser
  if (!user) return

  const carData = extractCarDataFromCard(card)
  const isFavorited = button.classList.contains("favorited")

  if (isFavorited) {
    // Remove from favorites
    db.collection("users")
      .doc(user.uid)
      .collection("favorites")
      .doc(carData.id)
      .delete()
      .then(() => {
        button.classList.remove("favorited")
        button.innerHTML = '<i class="far fa-heart"></i>'
        showNotification("Removed from favorites", "success")
      })
      .catch((error) => {
        console.error("Error removing favorite:", error)
        showNotification("Error removing favorite", "error")
      })
  } else {
    // Add to favorites
    db.collection("users")
      .doc(user.uid)
      .collection("favorites")
      .doc(carData.id)
      .set({
        ...carData,
        addedAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        button.classList.add("favorited")
        button.innerHTML = '<i class="fas fa-heart"></i>'
        showNotification("Added to favorites", "success")
      })
      .catch((error) => {
        console.error("Error adding favorite:", error)
        showNotification("Error adding favorite", "error")
      })
  }
}

// Extract car data from card element
function extractCarDataFromCard(card) {
  const title = card.querySelector(".car-result-title, .model-card h3")
  const year = card.querySelector(".car-result-year")
  const specs = card.querySelectorAll(".car-spec-value")

  return {
    id: `${title?.textContent || "unknown"}_${year?.textContent || "unknown"}`.replace(/\s+/g, "_").toLowerCase(),
    title: title?.textContent || "Unknown Car",
    year: year?.textContent || "Unknown Year",
    specs: Array.from(specs).map((spec) => spec.textContent),
  }
}

// Load personalized recommendations
function loadPersonalizedRecommendations() {
  const user = auth.currentUser
  if (!user) return

  // Load user's favorites to show recommendations
  db.collection("users")
    .doc(user.uid)
    .collection("favorites")
    .get()
    .then((querySnapshot) => {
      const favorites = []
      querySnapshot.forEach((doc) => {
        favorites.push(doc.data())
      })

      if (favorites.length > 0) {
        showRecommendations(favorites)
      }
    })
    .catch((error) => {
      console.error("Error loading recommendations:", error)
    })
}

// Show personalized recommendations
function showRecommendations(favorites) {
  const modelsSection = document.getElementById("models")
  if (!modelsSection || document.getElementById("recommendations-section")) return

  const recommendationsSection = document.createElement("div")
  recommendationsSection.id = "recommendations-section"
  recommendationsSection.className = "recommendations-section"
  recommendationsSection.innerHTML = `
        <h3>🎯 Recommended for You</h3>
        <p>Based on your favorites and browsing history</p>
        <div class="recommendations-grid">
            ${generateRecommendationCards(favorites)}
        </div>
    `

  modelsSection.parentNode.insertBefore(recommendationsSection, modelsSection.nextSibling)
}

// Generate recommendation cards
function generateRecommendationCards(favorites) {
  const recommendations = [
    {
      title: "BMW M4 Competition",
      description: "High-performance sports car similar to your favorites",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      title: "Audi RS6 Avant",
      description: "Luxury performance wagon you might enjoy",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      title: "Mercedes-AMG GT",
      description: "Premium sports car matching your preferences",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
  ]

  return recommendations
    .map(
      (car) => `
        <div class="recommendation-card">
            <img src="${car.image}" alt="${car.title}">
            <h4>${car.title}</h4>
            <p>${car.description}</p>
            <button onclick="exploreRecommendation('${car.title}')">Explore</button>
        </div>
    `,
    )
    .join("")
}

// Explore recommendation
function exploreRecommendation(carTitle) {
  showSection("car-database")
  // Auto-search for the recommended car
  const searchInput = document.querySelector(".search-input")
  if (searchInput) {
    searchInput.value = carTitle
    performSearch()
  }
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `

  // Add to page
  document.body.appendChild(notification)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

// Section navigation
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section")
  sections.forEach((section) => section.classList.remove("active"))
  const sectionToShow = document.getElementById(sectionId)
  if (sectionToShow) {
    sectionToShow.classList.add("active")
  }
}

// Search functionality
function performSearch() {
  const searchTerm = document.querySelector(".search-input").value.toLowerCase()
  if (searchTerm.trim() === "") return

  // Simple search logic - you can enhance this
  if (searchTerm.includes("spec") || searchTerm.includes("performance") || searchTerm.includes("engine")) {
    showSection("specifications")
  } else if (
    searchTerm.includes("model") ||
    searchTerm.includes("gt") ||
    searchTerm.includes("sport") ||
    searchTerm.includes("luxury")
  ) {
    showSection("models")
  } else if (searchTerm.includes("about") || searchTerm.includes("heritage") || searchTerm.includes("innovation")) {
    showSection("about")
  } else if (searchTerm.includes("contact") || searchTerm.includes("phone") || searchTerm.includes("email")) {
    showSection("contact")
  } else if (searchTerm.includes("gallery") || searchTerm.includes("photo") || searchTerm.includes("image")) {
    showSection("gallery")
  } else if (searchTerm.includes("database") || searchTerm.includes("cars") || searchTerm.includes("search")) {
    showSection("car-database")
  } else {
    showSection("home")
  }

  document.querySelector(".search-input").value = ""
}

// Initialize car database functionality
function initializeCarDatabase() {
  console.log("Initializing car database...")
  // Add your car database initialization code here
}

// Initialize test drive features
function initializeTestDriveFeatures() {
  console.log("Initializing test drive features...")
  // Set minimum date for test drive booking
  const testDriveDateInput = document.getElementById("test-drive-date")
  if (testDriveDateInput) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    testDriveDateInput.min = tomorrow.toISOString().split("T")[0]
  }
}

// Initialize chatbot
function initializeChatbot() {
  console.log("Initializing chatbot...")
  // Enable send button when user types
  const chatInput = document.getElementById("chatbot-input")
  if (chatInput) {
    chatInput.addEventListener("input", function () {
      const sendBtn = document.getElementById("chatbot-send")
      if (sendBtn) {
        sendBtn.disabled = this.value.trim() === ""
      }
    })
  }
}

// Load email service
function loadEmailService() {
  const script = document.createElement("script")
  script.src = "js/email-service.js"
  script.async = true
  document.head.appendChild(script)
}

// Load test drive booking
function loadTestDriveBooking() {
  const script = document.createElement("script")
  script.src = "js/test-drive-booking.js"
  script.async = true
  document.head.appendChild(script)
}

// Chatbot functionality
function toggleChatbot() {
  const container = document.getElementById("chatbot-container")
  const toggle = document.getElementById("chatbot-toggle")

  if (container.style.display === "none" || container.style.display === "") {
    container.style.display = "flex"
    toggle.style.display = "none"
    document.getElementById("chatbot-input").focus()
  } else {
    container.style.display = "none"
    toggle.style.display = "flex"
  }
}

function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage()
  }
}

function askQuickQuestion(question) {
  document.getElementById("chatbot-input").value = question
  sendChatMessage()
}

function sendChatMessage() {
  const input = document.getElementById("chatbot-input")
  const message = input.value.trim()

  if (!message) return

  // Add user message to chat
  addMessageToChat(message, "user")
  input.value = ""

  // Simulate bot response (replace with actual AI integration)
  setTimeout(() => {
    const response = generateBotResponse(message)
    addMessageToChat(response, "bot")
  }, 1000)
}

function addMessageToChat(message, sender) {
  const messagesContainer = document.getElementById("chatbot-messages")
  const messageDiv = document.createElement("div")
  messageDiv.className = `${sender}-message`

  const avatar = document.createElement("div")
  avatar.className = "message-avatar"
  avatar.textContent = sender === "bot" ? "🤖" : "👤"

  const content = document.createElement("div")
  content.className = "message-content"
  content.innerHTML = `<p>${message}</p>`

  messageDiv.appendChild(avatar)
  messageDiv.appendChild(content)
  messagesContainer.appendChild(messageDiv)

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function generateBotResponse(message) {
  // Simple response logic - replace with actual AI
  const responses = {
    "elite gt": "The Elite GT features a V8 Twin-Turbo engine with 650 HP and can go 0-60 mph in just 3.0 seconds!",
    "test drive":
      "You can book a test drive by visiting our Test Drive section. We offer both Elite Car Series and database car options.",
    specifications:
      "Our flagship model features a 4.0L V8 Twin-Turbocharged engine with 650 HP and 620 lb-ft of torque.",
    default:
      "Thank you for your question! I can help you with information about our Elite Car Series, specifications, test drives, and more. What would you like to know?",
  }

  const lowerMessage = message.toLowerCase()
  for (const [key, response] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return response
    }
  }

  return responses.default
}

// Test drive functionality placeholders
function selectEliteModel(modelName) {
  console.log(`Selected Elite model: ${modelName}`)
  // Add your test drive selection logic here
}

function searchCars() {
  console.log("Searching cars...")
  // Add your car search logic here
}

function loadCarModels() {
  console.log("Loading car models...")
  // Add your car models loading logic here
}

function searchTestDriveCars() {
  console.log("Searching test drive cars...")
  // Add your test drive car search logic here
}

function loadTestDriveModels() {
  console.log("Loading test drive models...")
  // Add your test drive models loading logic here
}

function submitTestDrive(event) {
  event.preventDefault()
  console.log("Submitting test drive...")
  // Add your test drive submission logic here
}

function cancelTestDrive() {
  console.log("Cancelling test drive...")
  // Add your test drive cancellation logic here
}

function closeConfirmation() {
  console.log("Closing confirmation...")
  // Add your confirmation close logic here
}

function addToCalendar() {
  console.log("Adding to calendar...")
  // Add your calendar integration logic here
}

function showTerms() {
  alert(
    "Terms and Conditions:\n\n1. Valid driver's license required\n2. Must be 18+ years old\n3. Insurance coverage required\n4. Test drive limited to designated routes\n5. Vehicle inspection before and after\n6. No smoking or food/drinks in vehicle\n7. Maximum 2 passengers allowed\n8. Professional driver accompanies test drive",
  )
}
