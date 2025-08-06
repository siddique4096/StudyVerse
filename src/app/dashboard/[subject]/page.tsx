'use client';

import { SubjectView } from '@/components/dashboard/subject-view';
import { SUBJECTS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { use } from 'react';

export default function SubjectPage({ params }: { params: Promise<{ subject: string }> }) {
    const { subject: subjectId } = use(params);
    const subject = SUBJECTS.find(s => s.id === subjectId);

    if (!subject) {
        notFound();
    }

    return (
        <ScrollArea className="h-full">
            <SubjectView subjectId={subject.id} subjectName={subject.name} />
        </ScrollArea>
    );
}
