// Authentication JavaScript for index.html (Login/Register page)

// Firebase imports
import { auth, db, firebase } from "./firebaseConfig.js"

// DOM Elements
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const forgotPasswordForm = document.getElementById("forgot-password-form")
const authTabs = document.querySelectorAll(".auth-tab")
const successMessage = document.getElementById("success-message")
const loadingScreen = document.getElementById("loading-screen")

// Password validation elements
const passwordInput = document.getElementById("register-password")
const lengthRequirement = document.getElementById("length-requirement")
const uppercaseRequirement = document.getElementById("uppercase-requirement")
const numberRequirement = document.getElementById("number-requirement")
const specialRequirement = document.getElementById("special-requirement")

// Hide loading screen initially
if (loadingScreen) {
  loadingScreen.style.display = "none"
}

// Check if user is already logged in when page loads
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is already signed in, redirect to dashboard
    showLoadingScreen("Redirecting to dashboard...")
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 1000)
  } else {
    // User is not signed in, hide loading screen
    hideLoadingScreen()
  }
})

// Show loading screen
function showLoadingScreen(message = "Loading...") {
  if (loadingScreen) {
    loadingScreen.querySelector("p").textContent = message
    loadingScreen.style.display = "flex"
  }
}

// Hide loading screen
function hideLoadingScreen() {
  if (loadingScreen) {
    loadingScreen.style.display = "none"
  }
}

// Tab switching
authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.getAttribute("data-tab")

    // Update active tab
    authTabs.forEach((t) => t.classList.remove("active"))
    tab.classList.add("active")

    // Show corresponding form
    document.querySelectorAll(".auth-form").forEach((form) => {
      form.classList.remove("active")
    })

    if (tabName === "login") {
      loginForm.classList.add("active")
    } else if (tabName === "register") {
      registerForm.classList.add("active")
    }

    // Hide success message when switching tabs
    successMessage.classList.remove("show")
  })
})

// Password visibility toggle
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId)
  const icon = input.nextElementSibling.querySelector("i")

  if (input.type === "password") {
    input.type = "text"
    icon.classList.remove("fa-eye")
    icon.classList.add("fa-eye-slash")
  } else {
    input.type = "password"
    icon.classList.remove("fa-eye-slash")
    icon.classList.add("fa-eye")
  }
}

// Password validation
if (passwordInput) {
  passwordInput.addEventListener("input", validatePassword)
}

function validatePassword() {
  const password = passwordInput.value

  // Check length
  if (password.length >= 8) {
    lengthRequirement.classList.add("valid")
  } else {
    lengthRequirement.classList.remove("valid")
  }

  // Check uppercase
  if (/[A-Z]/.test(password)) {
    uppercaseRequirement.classList.add("valid")
  } else {
    uppercaseRequirement.classList.remove("valid")
  }

  // Check number
  if (/[0-9]/.test(password)) {
    numberRequirement.classList.add("valid")
  } else {
    numberRequirement.classList.remove("valid")
  }

  // Check special character
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    specialRequirement.classList.add("valid")
  } else {
    specialRequirement.classList.remove("valid")
  }
}

// Show error message
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.classList.add("show")

    // Hide error after 5 seconds
    setTimeout(() => {
      errorElement.classList.remove("show")
    }, 5000)
  }
}

// Show success message
function showSuccess(message) {
  if (successMessage) {
    successMessage.textContent = message
    successMessage.classList.add("show")

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.classList.remove("show")
    }, 5000)
  }
}

// Form navigation
function showLoginForm() {
  authTabs[0].click()
}

function showRegisterForm() {
  authTabs[1].click()
}

function showForgotPassword() {
  document.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.remove("active")
  })
  forgotPasswordForm.classList.add("active")
}

// Login form submission
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value
    const loginBtn = document.getElementById("login-btn")

    // Disable button during authentication
    loginBtn.disabled = true
    loginBtn.textContent = "Logging in..."

    try {
      await auth.signInWithEmailAndPassword(email, password)
      showSuccess("Login successful! Redirecting...")
      showLoadingScreen("Redirecting to dashboard...")

      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)

      if (error.code === "auth/user-not-found") {
        showError("login-email-error", "No account found with this email")
      } else if (error.code === "auth/wrong-password") {
        showError("login-password-error", "Incorrect password")
      } else if (error.code === "auth/invalid-email") {
        showError("login-email-error", "Invalid email format")
      } else {
        showError("login-email-error", error.message)
      }

      // Re-enable button
      loginBtn.disabled = false
      loginBtn.textContent = "Login"
    }
  })
}

// Register form submission
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("register-name").value
    const email = document.getElementById("register-email").value
    const password = document.getElementById("register-password").value
    const confirmPassword = document.getElementById("register-confirm-password").value
    const registerBtn = document.getElementById("register-btn")

    // Validate password match
    if (password !== confirmPassword) {
      showError("register-confirm-password-error", "Passwords do not match")
      return
    }

    // Validate password strength
    if (password.length < 8) {
      showError("register-password-error", "Password must be at least 8 characters")
      return
    }

    if (!/[A-Z]/.test(password)) {
      showError("register-password-error", "Password must contain at least one uppercase letter")
      return
    }

    if (!/[0-9]/.test(password)) {
      showError("register-password-error", "Password must contain at least one number")
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      showError("register-password-error", "Password must contain at least one special character")
      return
    }

    // Disable button during registration
    registerBtn.disabled = true
    registerBtn.textContent = "Creating Account..."

    try {
      // Create user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(email, password)
      const user = userCredential.user

      // Add user profile to Firestore
      await db.collection("users").doc(user.uid).set({
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        provider: "email",
      })

      // Update user profile
      await user.updateProfile({
        displayName: name,
      })

      showSuccess("Account created successfully! Redirecting...")
      showLoadingScreen("Setting up your account...")

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)

      if (error.code === "auth/email-already-in-use") {
        showError("register-email-error", "Email is already in use")
      } else if (error.code === "auth/invalid-email") {
        showError("register-email-error", "Invalid email format")
      } else if (error.code === "auth/weak-password") {
        showError("register-password-error", "Password is too weak")
      } else {
        showError("register-email-error", error.message)
      }

      // Re-enable button
      registerBtn.disabled = false
      registerBtn.textContent = "Create Account"
    }
  })
}

// Forgot password form submission
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("forgot-email").value
    const resetBtn = document.getElementById("reset-btn")

    // Disable button during password reset
    resetBtn.disabled = true
    resetBtn.textContent = "Sending..."

    try {
      await auth.sendPasswordResetEmail(email)
      showSuccess("Password reset email sent! Check your inbox.")

      // Show login form after 3 seconds
      setTimeout(() => {
        showLoginForm()
      }, 3000)
    } catch (error) {
      console.error("Password reset error:", error)

      if (error.code === "auth/user-not-found") {
        showError("forgot-email-error", "No account found with this email")
      } else if (error.code === "auth/invalid-email") {
        showError("forgot-email-error", "Invalid email format")
      } else {
        showError("forgot-email-error", error.message)
      }

      // Re-enable button
      resetBtn.disabled = false
      resetBtn.textContent = "Reset Password"
    }
  })
}

// Social authentication
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()

  // Force account selection - this will show Google account picker
  provider.setCustomParameters({
    prompt: "select_account",
  })

  // Add additional scopes if needed
  provider.addScope("profile")
  provider.addScope("email")

  showLoadingScreen("Connecting to Google...")

  auth
    .signInWithPopup(provider)
    .then(async (result) => {
      // Check if user is new
      const isNewUser = result.additionalUserInfo.isNewUser

      if (isNewUser) {
        // Add user to Firestore
        await db.collection("users").doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: "google",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        showSuccess("Account created with Google! Redirecting...")
      } else {
        showSuccess("Logged in with Google! Redirecting...")
      }

      showLoadingScreen("Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    })
    .catch((error) => {
      console.error("Google sign-in error:", error)
      hideLoadingScreen()

      // Handle specific error cases
      if (error.code === "auth/popup-closed-by-user") {
        showError("login-email-error", "Sign-in was cancelled")
      } else if (error.code === "auth/popup-blocked") {
        showError("login-email-error", "Popup was blocked. Please allow popups and try again")
      } else {
        showError("login-email-error", error.message)
      }
    })
}

function signInWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider()

  showLoadingScreen("Connecting to Facebook...")

  auth
    .signInWithPopup(provider)
    .then(async (result) => {
      // Check if user is new
      const isNewUser = result.additionalUserInfo.isNewUser

      if (isNewUser) {
        // Add user to Firestore
        await db.collection("users").doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          provider: "facebook",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
        showSuccess("Account created with Facebook! Redirecting...")
      } else {
        showSuccess("Logged in with Facebook! Redirecting...")
      }

      showLoadingScreen("Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    })
    .catch((error) => {
      console.error("Facebook sign-in error:", error)
      hideLoadingScreen()
      showError("login-email-error", error.message)
    })
}
const auth = firebase.auth();

const googleBtn = document.getElementById("googleSignIn");

// Email/Password login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "enhanced-elite-cars-series.html"; // 🔁 redirect
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});

// Google login
googleBtn.addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "enhanced-elite-cars-series.html"; // 🔁 redirect
  } catch (error) {
    alert("Google Sign-In failed: " + error.message);
  }

  const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "enhanced-elite-cars-series.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
}

});
