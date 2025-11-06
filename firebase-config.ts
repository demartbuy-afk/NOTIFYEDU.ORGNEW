// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY6BAEqrYNVzC8do1P1Tleyc2g8zIkuRw",
  authDomain: "notifyedu-644a2.firebaseapp.com",
  databaseURL: "https://notifyedu-644a2-default-rtdb.firebaseio.com",
  projectId: "notifyedu-644a2",
  storageBucket: "notifyedu-644a2.appspot.com",
  messagingSenderId: "319062048303",
  appId: "1:319062048303:web:472823f58aa1fcbb0150da",
  measurementId: "G-FTE0YGEJ3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
const db = getDatabase(app);

// Get a reference to the Analytics service
const analytics = getAnalytics(app);

export { app, db, analytics };
