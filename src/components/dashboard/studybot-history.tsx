'use client';

import { useContext } from 'react';
import { ChatHistoryContext } from '@/context/chat-history-provider';
import { Button } from '../ui/button';
import { PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

export function StudyBotHistory() {
  const { chats, activeChatId, setActiveChatId, createNewChat, deleteChat } = useContext(ChatHistoryContext);

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col">
      <div className="p-2 border-b">
        <Button variant="outline" className="w-full justify-start" onClick={createNewChat}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chats.map((chat) => (
            <div key={chat.id} className="relative group">
              <Button
                variant={activeChatId === chat.id ? 'secondary' : 'ghost'}
                className="w-full justify-start pr-8 truncate"
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={(e) => handleDelete(e, chat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className='p-2 border-t'>
         <p className="text-xs text-muted-foreground text-center">
            Your conversations are saved locally.
          </p>
      </div>
    </aside>
  );
}
