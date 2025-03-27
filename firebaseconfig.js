// firebaseconfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC2Rz-4Wo_LF1ii8vBvR9l9KZRngRt1x3Y",
    authDomain: "expoapp-c9264.firebaseapp.com",
    projectId: "expoapp-c9264",
    storageBucket: "expoapp-c9264.firebasestorage.app",
    messagingSenderId: "968944603525",
    appId: "1:968944603525:web:9c29522e5b36ba5248b4ec",
    measurementId: "G-8B6DPVRTFH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);