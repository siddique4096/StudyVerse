'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bot } from 'lucide-react';
import { StudyBot } from './study-bot';
import { GroupChat } from './group-chat';
import { Button } from '../ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export function RightPanel() {
  const isMobile = useIsMobile();

  const content = (
    <Tabs defaultValue="studybot" className="flex flex-col h-full w-full">
      <TabsList className="grid w-full grid-cols-2 m-2">
        <TabsTrigger value="studybot">
          <Bot className="mr-2 h-4 w-4" /> StudyBot
        </TabsTrigger>
        <TabsTrigger value="chat">
          <MessageSquare className="mr-2 h-4 w-4" /> Chat
        </TabsTrigger>
      </TabsList>
      <TabsContent value="studybot" className="flex-1 mt-0">
        <StudyBot />
      </TabsContent>
      <TabsContent value="chat" className="flex-1 mt-0">
        <GroupChat />
      </TabsContent>
    </Tabs>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
              <Bot className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80%] p-0">
            {content}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-full max-w-sm border-l">
      {content}
    </aside>
  );
}
