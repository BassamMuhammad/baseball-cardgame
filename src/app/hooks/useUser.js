"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useApp } from "./useApp";

export function useUser() {
  const [user, setUser] = useState();
  const app = useApp();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(app), (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  return user;
}
