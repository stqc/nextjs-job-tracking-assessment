import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect visitors to the dashboard or login page
  redirect('/login');
  
  // This won't be rendered because of the redirect
  return null;
}