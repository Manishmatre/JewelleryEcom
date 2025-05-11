// Firebase configuration for ShilpoKotha
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtJKUsIXJBbc_8LvBJ4FOPezDM6q5z9y4",
  authDomain: "silpokotha-e6262.firebaseapp.com",
  projectId: "silpokotha-e6262",
  storageBucket: "silpokotha-e6262.firebasestorage.app",
  messagingSenderId: "250475067541",
  appId: "1:250475067541:web:83e23388b0e641d7fc839c",
  measurementId: "G-RF4SX0VYPG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const registerUser = async (email, password, userData) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      ...userData,
      email: email,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { success: true, user };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// User data functions
export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: "User data not found" };
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    return { success: false, error: error.message };
  }
};

// Update user profile with address
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Get current user data
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const currentData = userDoc.data();
    
    // Update the user document with new profile data
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      displayName: profileData.displayName || currentData.displayName || '',
      phoneNumber: profileData.phoneNumber || currentData.phoneNumber || '',
      address: profileData.address || currentData.address || {},
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }
};

// Password Reset function
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error.message };
  }
};

// Google Authentication function
export const signInWithGoogle = async () => {
  try {
    // Configure Google provider to select an account each time
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Add additional scopes if needed
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Sign in with popup
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get user from result
    const user = result.user;
    
    // We don't need to check Firestore anymore since we're using local storage
    // The user data will be saved to local storage by the calling page
    
    return { success: true, user };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    
    // Provide more specific error messages
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'An account already exists with the same email address but different sign-in credentials.';
    }
    
    return { success: false, error: errorMessage, code: error.code };
  }
};

// Export Firebase instances
export { auth, db };
