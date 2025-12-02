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
import type { SequenceMetadata } from './fastaParser';

// Firebase configuration
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection name
const SEQUENCES_COLLECTION = 'sequences';

/**
 * Store sequence metadata in Firebase
 */
export async function storeSequence(metadata: SequenceMetadata): Promise<string> {
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

/**
 * Store multiple sequences in Firebase
 */
export async function storeMultipleSequences(sequences: SequenceMetadata[]): Promise<string[]> {
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
export async function getAllSequences(): Promise<SequenceMetadata[]> {
  try {
    const q = query(
      collection(db, SEQUENCES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SequenceMetadata[];
  } catch (error) {
    console.error('Error getting sequences:', error);
    throw error;
  }
}

/**
 * Get recent sequences (limited)
 */
export async function getRecentSequences(limitCount: number = 10): Promise<SequenceMetadata[]> {
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
    })) as SequenceMetadata[];
  } catch (error) {
    console.error('Error getting recent sequences:', error);
    throw error;
  }
}

/**
 * Get single sequence by ID
 */
export async function getSequenceById(id: string): Promise<SequenceMetadata | null> {
  try {
    const docRef = doc(db, SEQUENCES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as SequenceMetadata;
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
export async function deleteSequence(id: string): Promise<void> {
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
export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};
