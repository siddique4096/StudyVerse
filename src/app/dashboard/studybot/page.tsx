import { StudyBot } from '@/components/dashboard/study-bot';
import { ChatHistoryProvider } from '@/context/chat-history-provider';

export default function StudyBotPage() {
  return (
    <ChatHistoryProvider>
      <StudyBot />
    </ChatHistoryProvider>
  );
}
