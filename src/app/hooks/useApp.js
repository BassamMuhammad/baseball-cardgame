"use client";
import { getApp, getApps, initializeApp } from "firebase/app";

export const useApp = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCk5uSwyniP2hUMexE-V9Si3zLdyPbQYJI",
    authDomain: "stellar-polymer-446615-m9.firebaseapp.com",
    projectId: "stellar-polymer-446615-m9",
    storageBucket: "stellar-polymer-446615-m9.firebasestorage.app",
    messagingSenderId: "968952514895",
    appId: "1:968952514895:web:ac1e9b8cf48e96e600dd3a",
    measurementId: "G-Y20K9DXXPF",
  };
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};
