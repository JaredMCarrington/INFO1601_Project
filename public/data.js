import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, 
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function saveUserLocation(userId, locationName) {
  try {
      await addDoc(collection(db, "savedLocations"), {
          userId: userId,
          location: locationName,
          createdAt: new Date()
      });
      return true;
  } catch (error) {
      console.error("Error saving location:", error);
      return false;
  }
}

async function getUserSavedLocations(userId) {
  try {
    const locationsRef = collection(db, "savedLocations");
    const userQuery = query(locationsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(userQuery);
    const savedLocations = [];
    querySnapshot.forEach((doc) => {
      savedLocations.push({
        id: doc.id,    
        location: doc.data().location,  
        userId: doc.data().userId      
      });
    });
    return savedLocations;
  } catch (error) {
    console.error("Error getting saved locations:", error);
    return [];
  }
}

async function deleteSavedLocation(locationId) {
  try {
      await deleteDoc(doc(db, "savedLocations", locationId));
      return true;
  } catch (error) {
      console.error("Error deleting location:", error);
      return false;
  }
}

export {db, saveUserLocation, getUserSavedLocations, deleteSavedLocation};
