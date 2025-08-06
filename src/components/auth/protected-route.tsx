'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserContext } from '@/context/user-provider';
import { Book } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const { username } = useContext(UserContext);

  useEffect(() => {
    const passwordValidated = localStorage.getItem('studyverse-password-validated') === 'true';

    if (!passwordValidated) {
      router.replace('/');
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsVerified(true);
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!isVerified) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <Book className="h-8 w-8 animate-pulse" />
          <h1 className="font-headline">StudyVerse</h1>
        </div>
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
