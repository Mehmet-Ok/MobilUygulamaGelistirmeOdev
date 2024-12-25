import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjXxPGpXAaIzYOEckcYpMdvht_uiCPGe0",
  authDomain: "userauth-fe50a.firebaseapp.com",
  projectId: "userauth-fe50a",
  storageBucket: "userauth-fe50a.firebasestorage.app",
  messagingSenderId: "887853085299",
  appId: "1:887853085299:web:344a8b71d9d44389a7f006"
};

// Initialize Firebase instances
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const FIREBASE_DB = getFirestore(FIREBASE_APP);

// Function to add lab results for a specific user
const addLabResult = async (userId) => {
  if (!userId) {
    console.error('User ID is required');
    return;
  }

  try {
    // Check if user exists
    const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }

    // Add lab results
    await addDoc(collection(FIREBASE_DB, 'labResults'), {
      userId: userId,
      patientName: `${userDoc.data().name} ${userDoc.data().surname}`,
      testDate: new Date().toISOString(),
      IgA: "150",
      IgM: "120",
      IgG: "1100",
      IgG1: "500",
      IgG2: "400",
      IgG3: "100",
      IgG4: "50",
      createdAt: new Date().toISOString()
    });
    
    console.log('Lab results added for user:', userId);
  } catch (error) {
    console.error('Error adding lab results:', error);
  }
};

// Export Firebase instances and functions
export { 
  FIREBASE_APP, 
  FIREBASE_AUTH, 
  FIREBASE_DB, 
  addLabResult 
};