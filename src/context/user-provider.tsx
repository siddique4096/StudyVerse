'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  username: string | null;
}

export const UserContext = createContext<UserContextType>({ username: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUsername = localStorage.getItem('studyverse-username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error("Could not access local storage", error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username }}>{children}</UserContext.Provider>
  );
}
