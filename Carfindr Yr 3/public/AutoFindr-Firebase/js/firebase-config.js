// Import the Firebase SDK
import * as firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

// Firebase configuration
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
firebase.initializeApp(firebaseConfig)

// Initialize services
const auth = firebase.auth()
const db = firebase.firestore()

// Export for use in other files
window.auth = auth
window.db = db
