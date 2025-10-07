export type UserRole = 'parent' | 'teacher';  // Union type for specific roles

export interface User {  // Interface for user object
    id: string;
    name: string;
    role: UserRole;  // TypeScript ensures role can only be 'parent' or 'teacher'
    email: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'normal' | 'info';
  createdAt: string;
  createdBy: string;
  targetAudience: string[];
}

export interface Event {
  id: string;
  title: string;
  type: 'meeting' | 'exam' | 'assignment';
  date: string;
  description: string;
  createdBy: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  description: string;
  status: 'pending' | 'submitted' | 'graded';
  class: string;
}
