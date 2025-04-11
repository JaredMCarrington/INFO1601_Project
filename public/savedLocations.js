import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
    getFirestore, 
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import firebaseConfig from "./firebaseConfig.js";
const db = getFirestore(app);

const Register = document.getElementById("register-btn");
Register.addEventListener('click', function(event){
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
   .then((userCredential) => {
    const user = userCredential.user;
    //create User Documents
    addDoc(collection (db, "users", user.uid), {
        email: user.email,
        uid: user.uid
    })
    .then(() => {
        alert("Account Registered. Click 'Login' to continue");
    })
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
})