import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCJgRPUJs0bhrYR94hZ9bxTZapt1Tq7aWE",
  authDomain: "carfindr-fd6ff.firebaseapp.com",
  projectId: "carfindr-fd6ff",
  storageBucket: "carfindr-fd6ff.firebasestorage.app",
  messagingSenderId: "672398840030",
  appId: "1:672398840030:web:bbedb3791a8e10f5f5f24f",
  measurementId: "G-LEEC0161RR",
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Firestore instance

const auth = firebase.auth();
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = registerForm.username.value.trim();
  const email = registerForm.email.value.trim();
  const password = registerForm.password.value;
  const confirmPassword = registerForm.confirmPassword.value;
 auth.createUserWithEmailAndPassword(email, password)
      .then((cred) => {
        return db.collection("users").doc(cred.user.uid).set({
          username: username,
          email: email
        });
      })
      .then(() => {
        window.location.href = "login.html";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
