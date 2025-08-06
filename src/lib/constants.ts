import {
  Calculator,
  Orbit,
  FlaskConical,
  Laptop,
  BookOpen,
  Briefcase,
  LineChart,
  NotebookText,
  type LucideIcon,
} from 'lucide-react';

export const SHARED_PASSWORD = 'Study123';

export interface Subject {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const SUBJECTS: Subject[] = [
  { id: 'mathematics', name: 'Mathematics', icon: Calculator },
  { id: 'physics', name: 'Physics', icon: Orbit },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical },
  { id: 'computer-science', name: 'Computer Science', icon: Laptop },
  { id: 'english-language', name: 'English Language', icon: BookOpen },
  { id: 'business-studies', name: 'Business Studies', icon: Briefcase },
  { id: 'economics', name: 'Economics', icon: LineChart },
  { id: 'accounts', name: 'Accounts', icon: NotebookText },
];
