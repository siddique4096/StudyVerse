import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome to StudyVerse!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BookOpen className="mx-auto h-16 w-16 text-primary" />
          <p className="text-muted-foreground">
            Your collaborative study hub is ready.
          </p>
          <p>
            Select a subject from the sidebar to view shared materials, or join the conversation in the group chat.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
