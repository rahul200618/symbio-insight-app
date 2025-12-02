const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) {
    return admin;
  }

  try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    } else {
      console.log('⚠️  Firebase not configured (optional)');
      return null;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin Initialized');
    
    return admin;
  } catch (error) {
    console.error('❌ Firebase Initialization Error:', error.message);
    return null;
  }
};

const getFirebaseAdmin = () => {
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  return firebaseInitialized ? admin : null;
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin
};
