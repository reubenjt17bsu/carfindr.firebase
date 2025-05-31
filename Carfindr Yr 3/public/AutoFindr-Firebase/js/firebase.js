/* js/firebase.js */
const firebaseConfig = {
  apiKey: "AIzaSyCJgRPUJs0bhrYR94hZ9bxTZapt1Tq7aWE",
  authDomain: "carfindr-fd6ff.firebaseapp.com",
  projectId: "carfindr-fd6ff",
  storageBucket: "carfindr-fd6ff.firebasestorage.app",
  messagingSenderId: "672398840030",
  appId: "1:672398840030:web:bbedb3791a8e10f5f5f24f",
  measurementId: "G-LEEC0161RR"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();