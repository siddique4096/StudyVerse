'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { studyBotRespondsToQuestions } from '@/ai/flows/studybot-responds-to-questions';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Bot, RefreshCw, Send, User } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { UserContext } from '@/context/user-provider';
import { ChatHistoryContext, Message } from '@/context/chat-history-provider';
import { v4 as uuidv4 } from 'uuid';
import { StudyBotHistory } from './studybot-history';

export function StudyBot() {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { username } = useContext(UserContext);
  const {
    activeChatId,
    chats,
    addMessageToChat,
    updateMessageInChat,
  } = useContext(ChatHistoryContext);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMessages = chats.find(c => c.id === activeChatId)?.messages || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [activeMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeChatId]);

  // Re-focus the input after the bot has finished responding
  useEffect(() => {
    if (!isSending) {
      inputRef.current?.focus();
    }
  }, [isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isSending) return;

    setIsSending(true);
    const userMessage: Message = { id: uuidv4(), role: 'user', content: input };
    addMessageToChat(activeChatId, userMessage);
    setInput('');

    const botMessagePlaceholder: Message = { id: uuidv4(), role: 'model', content: '...' };
    addMessageToChat(activeChatId, botMessagePlaceholder);

    try {
      const historyForFlow = activeMessages.map(msg => ({ role: msg.role, content: msg.content }));
      
      const response = await studyBotRespondsToQuestions({
        history: historyForFlow,
        question: input,
      });
      
      const botMessage: Message = { id: botMessagePlaceholder.id, role: 'model', content: response.response };
      updateMessageInChat(activeChatId, botMessagePlaceholder.id, botMessage);

    } catch (error) {
      console.error('Error getting response from StudyBot:', error);
      const errorMessage: Message = { 
        id: botMessagePlaceholder.id, 
        role: 'model', 
        content: "Sorry, I'm having trouble connecting right now. Please try again later."
      };
      updateMessageInChat(activeChatId, botMessagePlaceholder.id, errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <StudyBotHistory />
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {activeMessages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </Avatar>
                )}
                <div className={`rounded-lg p-3 text-sm max-w-xl whitespace-pre-wrap break-words ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.content === '...' ? (
                     <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4 bg-background">
          <form onSubmit={handleSendMessage} className="relative flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask StudyBot anything..."
              className="pr-12"
              disabled={isSending}
            />
            <Button type="submit" size="icon" disabled={isSending || !input.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
              {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Enter</kbd> to send. StudyBot may produce inaccurate information.
          </p>
        </div>
      </div>
    </div>
  );
}
