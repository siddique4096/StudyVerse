import { SUBJECTS } from '@/lib/constants';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-3xl font-bold">Subjects</h1>
          <p className="text-muted-foreground">
            Select a subject to view shared materials and collaborate.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SUBJECTS.map((subject) => (
            <Card key={subject.id} className="flex flex-col">
              <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <subject.icon className="h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-xl">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-4">
                <p className="text-muted-foreground text-sm mb-4">
                  Access notes, past papers, and chat with peers.
                </p>
                <Button asChild size="sm" className="mt-auto w-full">
                  <Link href={`/dashboard/${subject.id}`}>
                    View Subject <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
