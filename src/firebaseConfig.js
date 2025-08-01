// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAEvc2rBgr0baaGReVTG33A2JJuMtKgchA",
  authDomain: "geoattendanceapp-0501.firebaseapp.com",
  projectId: "geoattendanceapp-0501",
  storageBucket: "geoattendanceapp-0501.appspot.com",
  messagingSenderId: "974841498510",
  appId: "1:974841498510:web:927f9cce65c9902aa672df",
  measurementId: "G-9QPPZE57F7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
