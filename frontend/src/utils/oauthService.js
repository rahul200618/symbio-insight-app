/**
 * OAuth Service - Google & GitHub Authentication
 * 
 * Provides social login functionality using Firebase Authentication.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    GithubAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAur8NW0xkkWHPQyrJs8HFul6tTjpDW48c",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "symbio-f5507.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "symbio-f5507",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "symbio-f5507.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "483344695660",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:483344695660:web:3f155286ce68c059073349",
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Configure providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Sign in with Google
 * @returns {Promise<Object>} User data and token
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        // Send to backend to create/verify user and get JWT
        const response = await fetch(`${API_URL}/auth/oauth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken,
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                uid: user.uid
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'OAuth authentication failed');
        }

        const data = await response.json();
        return {
            user: data.user,
            token: data.token,
            isNewUser: data.isNewUser
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
}

/**
 * Sign in with GitHub
 * @returns {Promise<Object>} User data and token
 */
export async function signInWithGithub() {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;
        
        // Get Firebase ID token
        const idToken = await user.getIdToken();
        
        // Send to backend to create/verify user and get JWT
        const response = await fetch(`${API_URL}/auth/oauth/github`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idToken,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0],
                photoURL: user.photoURL,
                uid: user.uid
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'OAuth authentication failed');
        }

        const data = await response.json();
        return {
            user: data.user,
            token: data.token,
            isNewUser: data.isNewUser
        };
    } catch (error) {
        console.error('GitHub sign-in error:', error);
        throw error;
    }
}

/**
 * Sign out from Firebase (cleanup)
 */
export async function signOutOAuth() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
    }
}

/**
 * Check for redirect result (mobile flow)
 */
export async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            const idToken = await user.getIdToken();
            
            // Determine provider
            const providerId = result.providerId;
            const endpoint = providerId === 'google.com' ? 'google' : 'github';
            
            const response = await fetch(`${API_URL}/auth/oauth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idToken,
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL,
                    uid: user.uid
                })
            });

            if (!response.ok) {
                throw new Error('OAuth authentication failed');
            }

            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Redirect result error:', error);
        throw error;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onOAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export { auth };
