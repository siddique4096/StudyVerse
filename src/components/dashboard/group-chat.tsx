'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, Smile, WifiOff, RefreshCw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { UserContext } from '@/context/user-provider';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Message {
  id: string;
  text: string;
  username: string;
  createdAt: Timestamp | null;
}

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🤔', '🎉', '🔥'];
const QUICK_REPLIES = ["Let's start a study session!", "Anyone have notes on this?", "I'm stuck on this problem.", "Good luck everyone!"];

export function GroupChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { username } = useContext(UserContext);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db) {
      setError("Chat service is currently unavailable. Please try again later.");
      return;
    }
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Message)
      );
      setMessages(msgs);
      setError(null);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to connect to chat. Your messages will not be sent.");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (text.trim() === '' || !username || !db || isSending || error) return;
    
    setIsSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: text,
        username: username,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Could not send message. Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'sending...';
    return new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${message.username}`}
                />
                <AvatarFallback>{message.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-sm">{message.username}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
       {error && (
        <div className="p-4">
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={handleRefresh} variant="link" className="p-0 h-auto ml-1">
                Refresh connection.
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="border-t p-4 space-y-2 bg-background">
        <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
                <Badge 
                    key={reply} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleQuickReply(reply)}
                    aria-disabled={!!error}
                >
                    {reply}
                </Badge>
            ))}
        </div>
        <form onSubmit={handleSendMessage} className="relative flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={error ? "Chat is offline" : "Type a message..."}
            className="pr-20"
            autoComplete="off"
            disabled={isSending || !!error}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    handleSendMessage(e);
                }
            }}
          />
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!!error}>
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-4 gap-1">
                  {EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="icon"
                      onClick={() => addEmoji(emoji)}
                      className="text-xl"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit" size="icon" disabled={isSending || !!error}>
            {isSending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
