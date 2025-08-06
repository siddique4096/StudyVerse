'use client';

import { StudyBot } from '@/components/dashboard/study-bot';
import { StudyBotHistory } from '@/components/dashboard/studybot-history';

export default function StudyBotPage() {
  return (
    <div className="flex h-full">
      <StudyBotHistory />
      <div className="flex-1 flex flex-col">
        <StudyBot />
      </div>
    </div>
  );
}
