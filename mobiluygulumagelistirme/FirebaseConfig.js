import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence,
  doc,
  getDoc,
  getDocs, // Bu satırı ekle
  collection,
  addDoc,
  updateDoc,
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjXxPGpXAaIzYOEckcYpMdvht_uiCPGe0",
  authDomain: "userauth-fe50a.firebaseapp.com",
  projectId: "userauth-fe50a",
  storageBucket: "userauth-fe50a.firebasestorage.app",
  messagingSenderId: "887853085299",
  appId: "1:887853085299:web:344a8b71d9d44389a7f006"
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// Initialize Firestore with better performance settings
const FIREBASE_DB = initializeFirestore(FIREBASE_APP, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Enable offline persistence
enableMultiTabIndexedDbPersistence(FIREBASE_DB)
  .catch((err) => {
    console.error("Error enabling persistence:", err);
  });

// Add guideline
const addGuideline = async (data) => {
  try {
    const guidelineRef = doc(FIREBASE_DB, 'guidelines', data.name);
    await setDoc(guidelineRef, {
      ...data,
      createdAt: new Date().toISOString(),
      createdBy: FIREBASE_AUTH.currentUser.uid
    });
    return true;
  } catch (error) {
    console.error('Error adding guideline:', error);
    throw error;
  }
};

// Fetch guidelines
const fetchGuidelines = async () => {
  try {
    const guidelinesRef = collection(FIREBASE_DB, 'guidelines');
    const querySnapshot = await getDocs(guidelinesRef);
    const guidelines = {};
    querySnapshot.forEach((doc) => {
      guidelines[doc.id] = doc.data();
    });
    return guidelines;
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    throw error;
  }
};

// Check if user is admin/doctor
const isUserAdmin = async (uid) => {
  try {
    console.log('Checking admin status for:', uid);
    const userRef = doc(FIREBASE_DB, 'users', uid);
    const userDoc = await getDoc(userRef);
    console.log('User doc exists:', userDoc.exists());
    if (userDoc.exists()) {
      console.log('User data:', userDoc.data());
    }
    return userDoc.exists() && userDoc.data().userType === 'doctor';
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// Add lab result
const addLabResult = async (data) => {
  try {
    const { userId, doctorId, testDate, ...labValues } = data;
    const labResultRef = doc(FIREBASE_DB, 'labResults', userId);

    const existingDoc = await getDoc(labResultRef);
    let updatedResults = {};

    if (existingDoc.exists()) {
      updatedResults = {
        ...existingDoc.data(),
        [testDate]: {
          ...labValues,
          doctorId,
          testDate
        }
      };
    } else {
      updatedResults = {
        [testDate]: {
          ...labValues,
          doctorId,
          testDate
        }
      };
    }

    await setDoc(labResultRef, updatedResults);
    console.log('Lab results saved successfully');
  } catch (error) {
    console.error('Error adding lab result:', error);
    throw error;
  }
};

export {
  FIREBASE_AUTH,
  FIREBASE_DB,
  isUserAdmin,
  addLabResult,
  addGuideline,
  fetchGuidelines
};