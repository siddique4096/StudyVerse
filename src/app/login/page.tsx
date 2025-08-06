'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Book, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const passwordValidated = localStorage.getItem('studyverse-password-validated') === 'true';
    if (!passwordValidated) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Username',
        description: 'Username cannot be empty.',
      });
      return;
    }
    setLoading(true);
    try {
      localStorage.setItem('studyverse-username', username.trim());
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save session. Please enable local storage.',
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
            <UserPlus className="h-6 w-6 text-primary" />
            Choose a Username
          </CardTitle>
          <CardDescription>
            Enter a unique username to join the study space.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g., scholar99"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Enter StudyVerse'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
