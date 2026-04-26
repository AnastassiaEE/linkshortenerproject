# Authentication Patterns - Clerk Integration

## Overview

This application uses **Clerk v7.2.7** exclusively for all authentication. No other authentication methods are permitted.

## Core Rules

### ✅ Required Patterns

1. **Clerk Only**: All authentication must go through Clerk
2. **Modal Authentication**: Sign-in and sign-up must always launch as modals
3. **Protected Routes**: `/dashboard` requires authentication
4. **Smart Redirects**: Logged-in users accessing `/` redirect to `/dashboard`
5. **Server-Side Auth Checks**: Always verify authentication on the server

### ❌ Never Do

- ❌ Implement custom authentication (JWT, sessions, cookies)
- ❌ Use third-party auth libraries (NextAuth, Passport, etc.)
- ❌ Redirect to full-page sign-in/sign-up routes
- ❌ Skip authentication checks on protected routes
- ❌ Store passwords or auth tokens yourself

---

## Protected Routes

### Dashboard Protection Pattern

The `/dashboard` route must always require authentication.

```tsx
// ✅ app/dashboard/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Alternative: Using Middleware

For multiple protected routes, use Next.js middleware:

```tsx
// ✅ middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

## Homepage Redirect Pattern

Logged-in users accessing the homepage should be redirected to the dashboard.

```tsx
// ✅ app/page.tsx
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
```

---

## Modal Authentication

Sign-in and sign-up must always launch as modals, never as full-page redirects.

### Layout Configuration

```tsx
// ✅ app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Note**: The `shadcn` theme from `@clerk/ui/themes` ensures all Clerk UI components (modals, user button, etc.) match the shadcn/ui design system used throughout the application.

### Modal Sign-In Button

```tsx
// ✅ components/sign-in-button.tsx
'use client';

import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function SignInButtonComponent() {
  return (
    <SignInButton mode="modal">
      <Button>Sign In</Button>
    </SignInButton>
  );
}
```

### Modal Sign-Up Button

```tsx
// ✅ components/sign-up-button.tsx
'use client';

import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function SignUpButtonComponent() {
  return (
    <SignUpButton mode="modal">
      <Button variant="outline">Sign Up</Button>
    </SignUpButton>
  );
}
```

### ❌ Wrong: Full-Page Redirect

```tsx
// ❌ Never redirect to full pages
<SignInButton mode="redirect" redirectUrl="/sign-in">
  <Button>Sign In</Button>
</SignInButton>
```

---

## Server Actions with Auth

Always validate authentication in Server Actions.

```tsx
// ✅ app/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createLink(formData: FormData) {
  const { userId } = await auth();

  // Auth check
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const url = formData.get('url') as string;

  // Create link for authenticated user
  await db.insert(links).values({
    url,
    userId,
    shortCode: generateShortCode(),
    createdAt: new Date(),
  });

  revalidatePath('/dashboard');
}
```

### ❌ Wrong: Missing Auth Check

```tsx
// ❌ Never skip auth checks in Server Actions
export async function createLink(formData: FormData) {
  const url = formData.get('url') as string;

  // WRONG: No authentication check!
  await db.insert(links).values({
    url,
    shortCode: generateShortCode(),
  });
}
```

---

## Getting User Information

### In Server Components

```tsx
// ✅ Get authenticated user data
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/');
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}</h1>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

### In Client Components

```tsx
// ✅ Use Clerk hooks for client-side auth state
'use client';

import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user.firstName}!</div>;
}
```

---

## Database Relationships

Link user IDs from Clerk to your database records.

```tsx
// ✅ db/schema.ts - Link records to users
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  url: text('url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
});
```

### Query User's Links

```tsx
// ✅ Fetch only the authenticated user's data
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserLinks() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await db.select().from(links).where(eq(links.userId, userId));
}
```

---

## User Button Component

Display user profile with built-in Clerk UI.

```tsx
// ✅ components/user-button.tsx
'use client';

import { UserButton } from '@clerk/nextjs';

export function UserButtonComponent() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'h-10 w-10',
        },
      }}
    />
  );
}
```

---

## Environment Variables

Required Clerk environment variables:

```bash
# ✅ .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Customize sign-in/sign-up URLs (use modals instead)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## Common Pitfalls

### ⚠️ Pitfall 1: Client-Side Only Auth

```tsx
// ❌ Wrong: Client-side check only
'use client';

import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { isSignedIn } = useUser();

  // WRONG: Can be bypassed, no server validation!
  if (!isSignedIn) {
    return <div>Not authorized</div>;
  }

  return <div>Dashboard</div>;
}
```

```tsx
// ✅ Correct: Server-side check
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return <div>Dashboard</div>;
}
```

### ⚠️ Pitfall 2: Missing Authorization

```tsx
// ❌ Wrong: Authentication without authorization
export async function deleteLink(linkId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('Unauthorized');

  // WRONG: Deletes any link, not just user's links!
  await db.delete(links).where(eq(links.id, linkId));
}
```

```tsx
// ✅ Correct: Verify ownership
export async function deleteLink(linkId: string) {
  const { userId } = await auth();

  if (!userId) throw new Error('Unauthorized');

  // Verify the link belongs to this user
  await db.delete(links).where(
    and(
      eq(links.id, linkId),
      eq(links.userId, userId), // Authorization check
    ),
  );
}
```

### ⚠️ Pitfall 3: Incorrect Mode

```tsx
// ❌ Wrong: Redirects to full page
<SignInButton mode="redirect">
  <Button>Sign In</Button>
</SignInButton>
```

```tsx
// ✅ Correct: Opens modal
<SignInButton mode="modal">
  <Button>Sign In</Button>
</SignInButton>
```

---

## Testing Authentication

### Check Auth State

```tsx
// Test if user is authenticated
const { userId, sessionId } = await auth();
console.log('User ID:', userId);
console.log('Session ID:', sessionId);
```

### Development Tips

1. **Test protected routes** without auth to verify redirects work
2. **Test modal behavior** - ensure no full-page navigation
3. **Test authorization** - try accessing other users' data
4. **Test Server Actions** - verify auth checks are enforced

---

## Quick Reference

| Task                       | Function/Component            |
| -------------------------- | ----------------------------- |
| Check auth (Server)        | `await auth()`                |
| Get current user (Server)  | `await currentUser()`         |
| Check auth (Client)        | `useUser()` hook              |
| Sign-in modal              | `<SignInButton mode="modal">` |
| Sign-up modal              | `<SignUpButton mode="modal">` |
| User profile button        | `<UserButton />`              |
| Sign out                   | `<SignOutButton>`             |
| Protect route (middleware) | `clerkMiddleware()`           |
| Protect route (page)       | `await auth()` + `redirect()` |

---

## Summary

✅ **Always use Clerk** for authentication
✅ **Always use modals** for sign-in/sign-up (never full pages)
✅ **Always protect** `/dashboard` and other sensitive routes
✅ **Always redirect** logged-in users from `/` to `/dashboard`
✅ **Always check authorization** in Server Actions (not just authentication)
✅ **Always verify** on the server, never trust client-side checks alone

❌ **Never implement** custom auth
❌ **Never use** full-page redirects for auth UI
❌ **Never skip** authentication checks on protected routes
❌ **Never skip** authorization checks in Server Actions
❌ **Never trust** client-side auth checks for security
