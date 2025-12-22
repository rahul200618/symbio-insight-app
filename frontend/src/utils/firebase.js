// Firebase Configuration and Database Functions
// 
// SETUP INSTRUCTIONS:
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Enable Firestore Database
// 3. Get your Firebase config from Project Settings
// 4. Replace the config below with your actual Firebase credentials
// 5. Install Firebase: npm install firebase

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';

// Firebase configuration
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAur8NW0xkkWHPQyrJs8HFul6tTjpDW48c",
  authDomain: "symbio-f5507.firebaseapp.com",
  projectId: "symbio-f5507",
  storageBucket: "symbio-f5507.firebasestorage.app",
  messagingSenderId: "483344695660",
  appId: "1:483344695660:web:3f155286ce68c059073349",
  measurementId: "G-YHND62ZXQ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection name
const SEQUENCES_COLLECTION = 'sequences';


export async function storeSequence(metadata) {
    try {
        const docRef = await addDoc(collection(db, SEQUENCES_COLLECTION), {
            ...metadata,
            createdAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error storing sequence:', error);
        throw error;
    }
}


export async function storeMultipleSequences(sequences) {
    try {
        const promises = sequences.map(seq => storeSequence(seq));
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error storing multiple sequences:', error);
        throw error;
    }
}

/**
 * Get all sequences from Firebase
 */
export async function getAllSequences() {
    try {
        const q = query(
            collection(db, SEQUENCES_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting sequences:', error);
        throw error;
    }
}

/**
 * Get recent sequences (limited)
 */
export async function getRecentSequences(limitCount = 10) {
    try {
        const q = query(
            collection(db, SEQUENCES_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting recent sequences:', error);
        throw error;
    }
}

/**
 * Get single sequence by ID
 */
export async function getSequenceById(id) {
    try {
        const docRef = doc(db, SEQUENCES_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting sequence:', error);
        throw error;
    }
}

/**
 * Delete sequence by ID
 */
export async function deleteSequence(id) {
    try {
        await deleteDoc(doc(db, SEQUENCES_COLLECTION, id));
    } catch (error) {
        console.error('Error deleting sequence:', error);
        throw error;
    }
}

/**
 * Mock function for development (when Firebase is not configured)
 */
export const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};
