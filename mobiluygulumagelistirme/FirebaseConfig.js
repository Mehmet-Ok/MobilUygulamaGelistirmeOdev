import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence,
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjXxPGpXAaIzYOEckcYpMdvht_uiCPGe0",
  authDomain: "userauth-fe50a.firebaseapp.com",
  projectId: "userauth-fe50a",
  storageBucket: "userauth-fe50a.firebasestorage.app",
  messagingSenderId: "887853085299",
  appId: "1:887853085299:web:344a8b71d9d44389a7f006"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// Initialize Firestore with better performance settings
const FIREBASE_DB = initializeFirestore(FIREBASE_APP, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Enable offline persistence
if (typeof window !== 'undefined' && window.indexedDB) {
  enableMultiTabIndexedDbPersistence(FIREBASE_DB).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Failed to enable offline persistence: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.error('Failed to enable offline persistence: Browser does not support it');
    }
  });
} else {
  console.warn('IndexedDB persistence is not supported on this platform.');
}

// Define collections
const guidelinesCollection = collection(FIREBASE_DB, 'guidelines');
const usersCollection = collection(FIREBASE_DB, 'users');
const doctorPatientsCollection = collection(FIREBASE_DB, 'doctorPatients');

// Fetch guidelines
const fetchGuidelines = async () => {
  try {
    const querySnapshot = await getDocs(guidelinesCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching guidelines:', error);
    throw error;
  }
};

// Add guideline
const addGuideline = async (guideline) => {
  try {
    const docRef = await addDoc(guidelinesCollection, guideline);
    return docRef.id;
  } catch (error) {
    console.error('Error adding guideline:', error);
    throw error;
  }
};

// Check if user is admin/doctor
const isUserAdmin = async (uid) => {
  try {
    if (!uid) {
      console.error('No UID provided');
      return false;
    }

    const userRef = doc(FIREBASE_DB, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User document does not exist');
      return false;
    }

    const userData = userDoc.data();
    const isDoctor = userData.userType === 'doctor';
    console.log('User type:', userData.userType, 'Is doctor:', isDoctor);
    
    return isDoctor;
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
    const updatedResults = existingDoc.exists() 
      ? {
          ...existingDoc.data(),
          [testDate]: { ...labValues, doctorId, testDate }
        }
      : {
          [testDate]: { ...labValues, doctorId, testDate }
        };

    await setDoc(labResultRef, updatedResults);
    console.log('Lab results saved successfully');
  } catch (error) {
    console.error('Error adding lab result:', error);
    throw error;
  }
};

// Fetch patients
const fetchPatients = async () => {
  try {
    const q = query(usersCollection, where("userType", "==", "patient"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Fetch doctor patients
const fetchDoctorPatients = async (doctorId) => {
  try {
    const docRef = doc(FIREBASE_DB, 'doctorPatients', doctorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const patientIds = docSnap.data().patients || [];
      const patients = [];
      for (const patientId of patientIds) {
        const patientDoc = await getDoc(doc(FIREBASE_DB, 'users', patientId));
        if (patientDoc.exists()) {
          patients.push({ id: patientDoc.id, ...patientDoc.data() });
        }
      }
      return patients;
    }
    return [];
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw error;
  }
};

// Assign patient to doctor
const assignPatientToDoctor = async (doctorId, patientId) => {
  try {
    const docRef = doc(FIREBASE_DB, 'doctorPatients', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const existingPatients = docSnap.data().patients || [];
      if (!existingPatients.includes(patientId)) {
        await updateDoc(docRef, {
          patients: [...existingPatients, patientId]
        });
      }
    } else {
      await setDoc(docRef, {
        patients: [patientId]
      });
    }
  } catch (error) {
    console.error('Error assigning patient:', error);
    throw error;
  }
};

// Remove patient from doctor
const removePatientFromDoctor = async (doctorId, patientId) => {
  try {
    const docRef = doc(FIREBASE_DB, 'doctorPatients', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const existingPatients = docSnap.data().patients || [];
      await updateDoc(docRef, {
        patients: existingPatients.filter(id => id !== patientId)
      });
    }
  } catch (error) {
    console.error('Error removing patient:', error);
    throw error;
  }
};

export {
  FIREBASE_AUTH,
  FIREBASE_DB,
  fetchGuidelines,
  addGuideline,
  isUserAdmin,
  addLabResult,
  fetchPatients,
  fetchDoctorPatients,
  assignPatientToDoctor,
  removePatientFromDoctor
};