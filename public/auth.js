import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function displayError(message, isSuccess = false) {
    const errorDisplay = document.getElementById("errorDisplay");
    if (errorDisplay) {
        errorDisplay.textContent = message;
        if (isSuccess) {
            errorDisplay.style.color = "green";
        } else {
            errorDisplay.style.color = "red";
        }
        errorDisplay.style.margin = "10px 0";
        errorDisplay.style.textAlign = "center";
    }
    console.log(message);
}
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "./index.html";
    } catch (error) {
        let errorMessage = "Login failed. Please try again.";
        if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email format";
        } else if (error.code === "auth/user-not-found") {
            errorMessage = "No account found with this email";
        } else if (error.code === "auth/wrong-password") {
            errorMessage = "Incorrect password";
        }
        displayError(errorMessage);
    }
}

async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        displayError("Account registered successfully! You can now login.", true);
    } catch (error) {
        let errorMessage = "Registration failed. Please try again.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "Email already in use";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "Password should be at least 6 characters";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "Invalid email format";
        }
        displayError(errorMessage);
    }
}

async function logoutUser() {
  try {
      await signOut(auth);
      return true; 
  } catch (error) {
      console.error("Logout error:", error);
      return false;
  }
}

export {auth, loginUser, registerUser, logoutUser, onAuthStateChanged, getAuth};