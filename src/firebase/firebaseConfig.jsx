import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCvYqkyJVZ9w9TGLmbr8qcI6HauhzWf4pk",
    authDomain: "eventmanagement-3dac8.firebaseapp.com",
    projectId: "eventmanagement-3dac8",
    storageBucket: "eventmanagement-3dac8.firebasestorage.app",
    messagingSenderId: "773591141099",
    appId: "1:773591141099:web:853bf8bc7482b83e97ccae",
    measurementId: "G-NL3MM43N2J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);