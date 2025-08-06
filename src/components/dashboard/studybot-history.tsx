'use client';

import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import {
  ChatHistoryContext,
  type ChatHistoryItem,
} from '@/context/chat-history-provider';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function StudyBotHistory() {
  const {
    history,
    setHistory,
    currentChatId,
    startNewChat,
    switchChat,
    deleteChat,
  } = useContext(ChatHistoryContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'users', currentUser.uid, 'studybot-chats'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().lastMessage,
      }));
      setHistory(chatList);
    });

    return () => unsubscribe();
  }, [currentUser, setHistory]);
  
  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent switching to the chat when delete is clicked
    if (!currentUser) return;
    await deleteChat(chatId, currentUser.uid);
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col p-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={startNewChat}
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
      <div className="flex-1 overflow-y-auto mt-4">
        <nav className="flex flex-col gap-1">
          {history.map((chat) => (
            <div key={chat.id} className="relative group">
              <Button
                variant={currentChatId === chat.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2 truncate pr-8"
                onClick={() => switchChat(chat.id)}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">{chat.title || 'New Chat'}</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this chat. This action cannot be undone.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => handleDelete(e, chat.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
