import { SubjectView } from '@/components/dashboard/subject-view';
import { SUBJECTS } from '@/lib/constants';
import { notFound } from 'next/navigation';

export default function SubjectPage({ params }: { params: { subject: string } }) {
    const subject = SUBJECTS.find(s => s.id === params.subject);

    if (!subject) {
        notFound();
    }

    return <SubjectView subject={subject} />;
}

export async function generateStaticParams() {
    return SUBJECTS.map((subject) => ({
        subject: subject.id,
    }));
}
