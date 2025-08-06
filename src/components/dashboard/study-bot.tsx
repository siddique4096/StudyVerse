'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Bot, CornerDownLeft, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { studyBotRespondToQuestions } from '@/ai/flows/studybot-responds-to-questions';
import { UserContext } from '@/context/user-provider';
import { Skeleton } from '../ui/skeleton';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ChatMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  createdAt?: Timestamp | null;
}

export function StudyBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { username } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || !db) return;

    const q = query(
      collection(db, 'studybot-chats'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ChatMessage)
        );
        setMessages(msgs);
      },
      (error) => {
        console.error('Error fetching studybot messages:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load chat history.',
        });
      }
    );

    return () => unsubscribe();
  }, [currentUser, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        'div[data-radix-scroll-area-viewport]'
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const saveMessage = async (message: ChatMessage) => {
    if (!currentUser || !db) return;
    try {
      await addDoc(collection(db, 'studybot-chats'), {
        ...message,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving message: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save message.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading || !currentUser) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]); // Optimistic UI update
    await saveMessage(userMessage);
    
    setInput('');
    setIsLoading(true);

    try {
      const result = await studyBotRespondToQuestions({ question: input });
      const botMessage: ChatMessage = { sender: 'bot', text: result.response };
      await saveMessage(botMessage);
    } catch (error) {
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
      };
      await saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <h3 className="font-headline text-lg font-semibold p-4 border-b">
        Ask StudyBot
      </h3>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : ''
              }`}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback>
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
              </div>
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`}
                  />
                  <AvatarFallback>{username?.[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback>
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 space-y-2 w-48">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          )}
        </div>

        {messages.length === 0 && !isLoading && (
          <div className="text-center p-8 space-y-4">
            <Sparkles className="mx-auto h-12 w-12 text-primary/50" />
            <h4 className="font-headline text-lg">Your AI Study Partner</h4>
            <p className="text-muted-foreground text-sm">
              Stuck on a problem? Need a concept clarified? Ask away! Your
              conversation will be saved.
            </p>
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="relative flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask StudyBot..."
            className="pr-10"
            autoComplete="off"
            disabled={isLoading || !currentUser}
          />
          <Button type="submit" size="icon" disabled={isLoading || !currentUser}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          Press <CornerDownLeft className="h-3 w-3" /> to send. StudyBot may
          produce inaccurate information.
        </p>
      </div>
    </div>
  );
}
