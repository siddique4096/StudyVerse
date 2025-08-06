'use client';

import { SubjectView } from '@/components/dashboard/subject-view';
import { SUBJECTS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SubjectPage({ params }: { params: { subject: string } }) {
    const subject = SUBJECTS.find(s => s.id === params.subject);

    if (!subject) {
        notFound();
    }

    return (
        <ScrollArea className="h-full">
            <SubjectView subjectId={subject.id} subjectName={subject.name} />
        </ScrollArea>
    );
}
