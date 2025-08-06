'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatHistoryContextType {
  chats: Chat[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  updateMessageInChat: (chatId: string, messageId: string, newMessage: Message) => void;
  createNewChat: () => void;
  deleteChat: (chatId: string) => void;
}

export const ChatHistoryContext = createContext<ChatHistoryContextType>({
  chats: [],
  activeChatId: '',
  setActiveChatId: () => {},
  addMessageToChat: () => {},
  updateMessageInChat: () => {},
  createNewChat: () => {},
  deleteChat: () => {},
});

export const ChatHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem('studybot-chats');
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        if (parsedChats.length > 0) {
            setChats(parsedChats);
            setActiveChatId(parsedChats[0].id);
            return;
        }
      }
    } catch (error) {
      console.error("Failed to load chats from local storage", error);
    }
    // Only create a new chat if there are no chats loaded
    if (chats.length === 0) {
      createNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
        if(chats.length > 0) {
            localStorage.setItem('studybot-chats', JSON.stringify(chats));
        } else {
            // If all chats are deleted, remove the item from local storage
            localStorage.removeItem('studybot-chats');
        }
    } catch (error) {
      console.error("Failed to save chats to local storage", error);
    }
  }, [chats]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [
        {
          id: uuidv4(),
          role: 'model',
          content: "Hello! I'm StudyBot. How can I help you today?",
        },
      ],
    };
    setChats(prevChats => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
  };
  
  const deleteChat = (chatId: string) => {
    setChats(prevChats => {
        const remainingChats = prevChats.filter(chat => chat.id !== chatId);
        if (remainingChats.length === 0) {
            // createNewChat will handle setting the new active ID
            const newChat: Chat = {
              id: uuidv4(),
              title: 'New Conversation',
              messages: [
                {
                  id: uuidv4(),
                  role: 'model',
                  content: "Hello! I'm StudyBot. How can I help you today?",
                },
              ],
            };
            setActiveChatId(newChat.id);
            return [newChat];
        } else if (activeChatId === chatId) {
            setActiveChatId(remainingChats[0].id);
        }
        return remainingChats;
    });
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const newMessages = [...chat.messages, message];
          // Update title with the first user message
          if (chat.title === 'New Conversation' && message.role === 'user' && message.content.length > 0) {
            return { ...chat, messages: newMessages, title: message.content.substring(0, 30) };
          }
          return { ...chat, messages: newMessages };
        }
        return chat;
      })
    );
  };
  
  const updateMessageInChat = (chatId: string, messageId: string, newMessage: Message) => {
      setChats(prevChats =>
        prevChats.map(chat =>
            chat.id === chatId
            ? { ...chat, messages: chat.messages.map(msg => msg.id === messageId ? newMessage : msg) }
            : chat
        )
    );
  }

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        activeChatId,
        setActiveChatId,
        addMessageToChat,
        updateMessageInChat,
        createNewChat,
        deleteChat
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
};
