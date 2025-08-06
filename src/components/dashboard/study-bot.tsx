'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Bot, CornerDownLeft, Sparkles, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { studyBotRespondToQuestions } from '@/ai/flows/studybot-responds-to-questions';
import { UserContext } from '@/context/user-provider';
import { Skeleton } from '../ui/skeleton';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  where,
  type Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ChatHistoryContext, type ChatMessage } from '@/context/chat-history-provider';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function StudyBot() {
  const [input, setInput] = useState('');
  const { username } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { messages, setMessages, currentChatId, isLoading, setIsLoading, error, setError, loadMessages } = useContext(ChatHistoryContext);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentChatId && currentUser) {
      loadMessages(currentChatId, currentUser.uid);
    }
  }, [currentChatId, currentUser, loadMessages]);


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

  const saveMessage = async (chatId: string, message: ChatMessage) => {
    if (!currentUser || !db) return;
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'studybot-chats', chatId, 'messages'), {
        ...message,
        createdAt: serverTimestamp(),
      });
      // Update the parent chat document with the last message and timestamp for sorting history
      await setDoc(doc(db, 'users', currentUser.uid, 'studybot-chats', chatId), {
        lastMessage: message.text,
        updatedAt: serverTimestamp()
      }, { merge: true });
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
    if (input.trim() === '' || isLoading || !currentUser || !currentChatId) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]); // Optimistic UI update
    
    setInput('');
    setIsLoading(true);
    setError(null);
    await saveMessage(currentChatId, userMessage);

    try {
      const result = await studyBotRespondToQuestions({ question: input });
      const botMessage: ChatMessage = { sender: 'bot', text: result.response };
      await saveMessage(currentChatId, botMessage);
      // The onSnapshot listener will add the bot message to the state
    } catch (error) {
      console.error(error);
      const errorMessageText = 'Sorry, I encountered an error. Please try again.';
      const errorMessage: ChatMessage = {
        sender: 'bot',
        text: errorMessageText,
      };
      await saveMessage(currentChatId, errorMessage);
      setError(errorMessageText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
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
                className={`max-w-xs md:max-w-xl rounded-lg p-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background'
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
              <div className="bg-background rounded-lg p-3 space-y-2 w-48 shadow-sm">
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
      <div className="border-t p-4 bg-background">
        <div className="max-w-4xl mx-auto">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Request Failed</AlertTitle>
                    <AlertDescription>
                    {error}
                    </AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleSubmit} className="relative flex gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask StudyBot..."
                className="pr-10"
                autoComplete="off"
                disabled={isLoading || !currentUser || !currentChatId}
            />
            <Button type="submit" size="icon" disabled={isLoading || !currentUser || !currentChatId}>
                <Send className="h-5 w-5" />
            </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            Press <CornerDownLeft className="h-3 w-3" /> to send. StudyBot may
            produce inaccurate information.
            </p>
        </div>
      </div>
    </div>
  );
}
