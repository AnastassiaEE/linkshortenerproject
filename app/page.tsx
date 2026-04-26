import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();

  // Redirect authenticated users to dashboard
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Welcome to Link Shortener</h1>
      {/* Public homepage content */}
    </div>
  );
}
