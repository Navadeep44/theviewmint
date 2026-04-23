import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB49FzzSZAD0O7o4DHWkrwj_sETIsuV2Ws",
  authDomain: "theviewmint.firebaseapp.com",
  projectId: "theviewmint",
  storageBucket: "theviewmint.firebasestorage.app",
  messagingSenderId: "956014710077",
  appId: "1:956014710077:web:9044a32c90b1ba1bb5c954",
  measurementId: "G-4QC6LFE033"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
