'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SHARED_PASSWORD } from '@/lib/constants';
import { Book, ShieldCheck } from 'lucide-react';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password === SHARED_PASSWORD) {
      try {
        localStorage.setItem('studyverse-password-validated', 'true');
        router.push('/login');
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save session. Please enable local storage.',
        });
        setLoading(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect Password',
        description: 'The password you entered is incorrect. Please try again.',
      });
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-lg font-bold text-primary">
        <Book className="h-6 w-6" />
        <h1 className="font-headline text-xl">StudyVerse</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Access Required
          </CardTitle>
          <CardDescription>
            Please enter the shared access password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter access password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Proceed'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
