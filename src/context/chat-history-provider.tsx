'use client';

import { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp, collection, onSnapshot, query, orderBy, doc, deleteDoc, getDocs, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'bot';
  text: string;
  createdAt?: Timestamp | null;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
}

interface ChatHistoryContextType {
  history: ChatHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentChatId: string | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  startNewChat: () => void;
  switchChat: (chatId: string) => void;
  deleteChat: (chatId: string, userId: string) => Promise<void>;
  loadMessages: (chatId: string, userId: string) => Unsubscribe;
}

export const ChatHistoryContext = createContext<ChatHistoryContextType>({
  history: [],
  setHistory: () => {},
  messages: [],
  setMessages: () => {},
  currentChatId: null,
  setCurrentChatId: () => {},
  isLoading: false,
  setIsLoading: () => {},
  error: null,
  setError: () => {},
  startNewChat: () => {},
  switchChat: () => {},
  deleteChat: async () => {},
  loadMessages: () => () => {},
});

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // On initial load, if there's no chat selected, create a new one.
    if (currentChatId === null) {
      startNewChat();
    }
  }, []);

  const startNewChat = useCallback(() => {
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    setMessages([]);
    setError(null);
    router.push('/dashboard/studybot');
  }, [router]);

  const switchChat = useCallback((chatId: string) => {
    if (chatId === currentChatId) return;
    setCurrentChatId(chatId);
    setMessages([]);
    setError(null);
    router.push('/dashboard/studybot');
  }, [currentChatId, router]);
  
  const deleteChat = useCallback(async (chatId: string, userId: string) => {
    try {
        const chatDocRef = doc(db, 'users', userId, 'studybot-chats', chatId);
        // Delete subcollection 'messages'
        const messagesQuery = query(collection(chatDocRef, 'messages'));
        const messagesSnapshot = await getDocs(messagesQuery);
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Delete parent document
        await deleteDoc(chatDocRef);

        toast({ title: "Chat deleted", description: "The chat has been permanently removed." });

        // If the deleted chat was the current one, start a new chat
        if (currentChatId === chatId) {
            startNewChat();
        }
    } catch (error) {
        console.error("Error deleting chat: ", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not delete chat." });
    }
  }, [currentChatId, startNewChat, toast]);

  const loadMessages = useCallback((chatId: string, userId: string) => {
    setIsLoading(true);
    const q = query(
        collection(db, 'users', userId, 'studybot-chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const msgs = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as ChatMessage)
            );
            setMessages(msgs);
            setIsLoading(false);
        },
        (error) => {
            console.error('Error fetching studybot messages:', error);
            setError('Could not load chat history.');
            setIsLoading(false);
        }
    );
    return unsubscribe;
  }, []);

  const value = {
    history,
    setHistory,
    messages,
    setMessages,
    currentChatId,
    setCurrentChatId,
    isLoading,
    setIsLoading,
    error,
    setError,
    startNewChat,
    switchChat,
    deleteChat,
    loadMessages
  };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
}
