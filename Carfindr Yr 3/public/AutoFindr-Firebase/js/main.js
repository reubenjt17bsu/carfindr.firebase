// Main JavaScript for the car website

// Declare firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js"
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  FieldValue,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

document.addEventListener("DOMContentLoaded", () => {
  // Check authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      console.log("User is signed in:", user.displayName)
      updateUIForAuthenticatedUser(user)
    } else {
      // No user is signed in
      console.log("No user is signed in")
      updateUIForUnauthenticatedUser()
    }
  })

  // Initialize other functionality
  initializeCarDatabase()
  initializeTestDriveFeatures()
  initializeChatbot()

  // Load email service and test drive booking scripts
  loadScript("js/email-service.js")
  loadScript("js/test-drive-booking.js")
})

// Add helper function to load scripts
function loadScript(src) {
  const script = document.createElement("script")
  script.src = src
  script.async = true
  document.head.appendChild(script)
}

// Update UI for authenticated users
function updateUIForAuthenticatedUser(user) {
  // Add user profile to navigation
  const nav = document.querySelector("nav")

  // Check if profile element already exists
  if (!document.getElementById("user-profile")) {
    const profileElement = document.createElement("div")
    profileElement.id = "user-profile"
    profileElement.className = "user-profile"

    // Create profile content
    profileElement.innerHTML = `
            <div class="profile-dropdown">
                <div class="profile-trigger">
                    ${
                      user.photoURL
                        ? `<img src="${user.photoURL}" alt="${user.displayName}" class="profile-image">`
                        : `<div class="profile-initial">${user.displayName ? user.displayName[0].toUpperCase() : "U"}</div>`
                    }
                    <span class="profile-name">${user.displayName || "User"}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="profile-menu">
                    <a href="profile.html">My Profile</a>
                    <a href="favorites.html">Favorites</a>
                    <a href="test-drives.html">My Test Drives</a>
                    <a href="#" id="logout-btn">Logout</a>
                </div>
            </div>
        `

    nav.appendChild(profileElement)

    // Add event listener for logout
    document.getElementById("logout-btn").addEventListener("click", (e) => {
      e.preventDefault()
      signOut(auth)
        .then(() => {
          window.location.href = "auth.html"
        })
        .catch((error) => {
          console.error("Error signing out:", error)
        })
    })

    // Toggle dropdown menu
    const profileTrigger = document.querySelector(".profile-trigger")
    profileTrigger.addEventListener("click", () => {
      const profileMenu = document.querySelector(".profile-menu")
      profileMenu.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const profileDropdown = document.querySelector(".profile-dropdown")
      if (profileDropdown && !profileDropdown.contains(e.target)) {
        const profileMenu = document.querySelector(".profile-menu")
        if (profileMenu.classList.contains("active")) {
          profileMenu.classList.remove("active")
        }
      }
    })
  }

  // Show personalized content
  if (document.querySelector(".hero-content h1")) {
    document.querySelector(".hero-content h1").textContent = `Welcome back, ${user.displayName || "Car Enthusiast"}!`
  }

  // Enable features that require authentication
  enableAuthenticatedFeatures()
}

// Update UI for unauthenticated users
function updateUIForUnauthenticatedUser() {
  // Remove user profile if it exists
  const userProfile = document.getElementById("user-profile")
  if (userProfile) {
    userProfile.remove()
  }

  // Add login/register buttons to navigation
  const nav = document.querySelector("nav")
  if (!document.getElementById("auth-buttons")) {
    const authButtons = document.createElement("div")
    authButtons.id = "auth-buttons"
    authButtons.className = "auth-buttons"
    authButtons.innerHTML = `
            <a href="auth.html" class="auth-btn-link login-btn">Login</a>
            <a href="auth.html" class="auth-btn-link register-btn">Register</a>
        `
    nav.appendChild(authButtons)
  }

  // Disable features that require authentication
  disableAuthenticatedFeatures()
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

// Disable features for unauthenticated users
function disableAuthenticatedFeatures() {
  // Show login prompt for test drives
  const testDriveSection = document.getElementById("test-drive")
  if (testDriveSection) {
    const loginPrompt = document.createElement("div")
    loginPrompt.className = "login-prompt"
    loginPrompt.innerHTML = `
            <div class="login-prompt-content">
                <h3>🔒 Login Required</h3>
                <p>Please log in to book test drives and access personalized features.</p>
                <a href="auth.html" class="auth-btn">Login / Register</a>
            </div>
        `
    testDriveSection.insertBefore(loginPrompt, testDriveSection.firstChild)
  }
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
    deleteDoc(doc(db, "users", user.uid, "favorites", carData.id))
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
    setDoc(doc(db, "users", user.uid, "favorites", carData.id), {
      ...carData,
      addedAt: FieldValue.serverTimestamp(),
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

  // Load user's favorites and browsing history to show recommendations
  getDocs(collection(db, "users", user.uid, "favorites"))
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
  // Simple recommendation logic based on favorites
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

// Initialize car database functionality
function initializeCarDatabase() {
  // Load car makes when page loads
  loadCarMakes()

  // Add search functionality
  const searchInput = document.querySelector(".search-input")
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        performSearch()
      }
    })
  }
}

// Initialize test drive features
function initializeTestDriveFeatures() {
  // Load test drive car makes
  loadTestDriveCarMakes()

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

  // Auto-resize chatbot for mobile
  adjustChatbotForMobile()
  window.addEventListener("resize", adjustChatbotForMobile)
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

// Utility function to adjust chatbot for mobile
function adjustChatbotForMobile() {
  if (window.innerWidth <= 480) {
    const container = document.getElementById("chatbot-container")
    if (container) {
      container.style.width = "95vw"
      container.style.right = "2.5vw"
    }
  }
}

// Export functions for global access
window.updateUIForAuthenticatedUser = updateUIForAuthenticatedUser
window.updateUIForUnauthenticatedUser = updateUIForUnauthenticatedUser
window.showNotification = showNotification

// Declare missing functions
function showSection(sectionId) {
  // Implementation for showSection
  console.log(`Showing section: ${sectionId}`)
}

function performSearch() {
  // Implementation for performSearch
  console.log("Performing search")
}

function loadCarMakes() {
  // Implementation for loadCarMakes
  console.log("Loading car makes")
}

function loadTestDriveCarMakes() {
  // Implementation for loadTestDriveCarMakes
  console.log("Loading test drive car makes")
}
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});
