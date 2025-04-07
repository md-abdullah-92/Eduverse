import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // This would come from your auth context
  const userRole = 'student'; // or 'teacher' or 'admin'
  
  // Redirect to the appropriate dashboard based on user role
  if (userRole === 'student') {
    redirect('/dashboard/students');
  } else if (userRole === 'teacher') {
    redirect('/dashboard/teachers');
  } else if (userRole === 'admin') {
    redirect('/dashboard/admin');
  } else {
    redirect('/auth/login');
  }
}
