import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBFvPT0nS3k-d5XHM-aOGqfrL98TzvjWF8",
  authDomain: "anillama-cms.firebaseapp.com",
  projectId: "anillama-cms",
  storageBucket: "anillama-cms.firebasestorage.app",
  messagingSenderId: "685286979696",
  appId: "1:685286979696:web:14e9e55ff429ef2f341cb5",
  measurementId: "G-8ZR2STEW6K"
};


const app = initializeApp(firebaseConfig);


// Export both Auth and Firestore
export const auth = getAuth(app);

export const db = getFirestore(app);
