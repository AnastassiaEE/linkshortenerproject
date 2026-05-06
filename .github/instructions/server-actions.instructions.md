---
description: Read this before implementing data mutations to understand the required patterns for server actions, validation, and database operations in this project.
---

# Server Actions - Data Mutation Patterns

## Overview

All **data mutations** in this application must be performed through **Server Actions**. This provides type safety, automatic progressive enhancement, and secure server-side processing.

## Core Rules

### ✅ Required Patterns

1. **Server Actions for Mutations**: All create, update, delete operations via Server Actions
2. **Client Component Invocation**: Server Actions must be called from Client Components
3. **Colocation**: Server Action files named `actions.ts` and placed in same directory as calling component
4. **TypeScript Types**: Data passed to Server Actions must use proper TypeScript types (never `FormData` type)
5. **Zod Validation**: All input data must be validated with Zod schemas
6. **Auth First**: Check for logged-in user before any database operations
7. **Data Layer Abstraction**: Use helper functions from `/data` directory, never direct Drizzle queries in actions
8. **Return Objects, Never Throw**: Always return `{ error: string }` or `{ success: true, data }` - never throw errors

### ❌ Never Do

- ❌ Use API routes for internal data mutations
- ❌ Call Server Actions from Server Components
- ❌ Place `actions.ts` files in shared directories
- ❌ Use the `FormData` TypeScript type for action parameters
- ❌ Skip input validation
- ❌ Perform database operations without checking authentication
- ❌ Write Drizzle queries directly in Server Actions
- ❌ Throw errors - always return error objects instead

---

## File Structure & Colocation

### Correct Directory Structure

```
app/
  dashboard/
    page.tsx              // Server Component
    link-form.tsx         // Client Component (calls action)
    actions.ts            // Server Actions (colocated)
```

### ✅ Correct Action File Location

```tsx
// ✅ app/dashboard/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createLink } from '@/data/links';

const linkSchema = z.object({
  url: z.string().url(),
  slug: z.string().min(3).max(50),
});

export async function createLinkAction(data: { url: string; slug: string }) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // 2. Validate input
  const result = linkSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // 3. Use data layer helper
  try {
    const link = await createLink(userId, result.data);
    return { success: true, link };
  } catch (error) {
    return { error: 'Failed to create link' };
  }
}
```

### ❌ Wrong: Shared Actions File

```tsx
// ❌ lib/actions.ts - DON'T create shared action files
'use server';

export async function createLinkAction(data: any) {
  // This violates colocation principle
}
```

---

## Client Component Integration

### ✅ Correct: Call from Client Component

```tsx
// ✅ app/dashboard/link-form.tsx
'use client';

import { useState } from 'react';
import { createLinkAction } from './actions';
import { Button } from '@/components/ui/button';

export function LinkForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      url: formData.get('url') as string,
      slug: formData.get('slug') as string,
    };

    const result = await createLinkAction(data);

    if (result.error) {
      console.error(result.error);
    } else {
      console.log('Link created:', result.link);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="url" type="url" required />
      <input name="slug" type="text" required />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Link'}
      </Button>
    </form>
  );
}
```

### ❌ Wrong: Call from Server Component

```tsx
// ❌ app/dashboard/page.tsx - DON'T call actions from Server Components
import { createLinkAction } from './actions';

export default async function DashboardPage() {
  // ❌ Server Actions should not be called directly in Server Components
  await createLinkAction({ url: 'https://example.com', slug: 'test' });

  return <div>Dashboard</div>;
}
```

---

## Type Safety & Validation

### ✅ Correct: Typed Parameters with Zod

```tsx
// ✅ app/dashboard/actions.ts
'use server';

import { z } from 'zod';

// Define Zod schema
const updateLinkSchema = z.object({
  id: z.string(),
  url: z.string().url('Invalid URL'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be less than 50 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Slug can only contain letters, numbers, dashes, and underscores'),
});

// Infer TypeScript type from schema
type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export async function updateLinkAction(data: UpdateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  const result = updateLinkSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Use validated data
  const link = await updateLink(result.data.id, result.data, userId);
  return { success: true, link };
}
```

### ❌ Wrong: Using FormData Type or Any

```tsx
// ❌ app/dashboard/actions.ts
'use server';

// ❌ DON'T use FormData type
export async function createLinkAction(formData: FormData) {
  const url = formData.get('url');
  // No type safety, no validation
}

// ❌ DON'T use 'any'
export async function updateLinkAction(data: any) {
  // No type safety
}

// ❌ DON'T skip Zod validation
export async function deleteLinkAction(data: { id: string }) {
  // Missing validation
  await deleteLink(data.id);
}
```

---

## Authentication & Authorization

### ✅ Correct: Auth Check First

```tsx
// ✅ app/dashboard/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';

export async function deleteLinkAction(data: { id: string }) {
  // 1. Always check auth first
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized' };
  }

  // 2. Validate input
  const schema = z.object({ id: z.string() });
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: 'Invalid input' };
  }

  // 3. Verify ownership through data layer
  try {
    await deleteLink(result.data.id, userId);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete link' };
  }
}
```

### ❌ Wrong: Missing Auth Check

```tsx
// ❌ app/dashboard/actions.ts
'use server';

export async function deleteLinkAction(data: { id: string }) {
  // ❌ Missing auth check - security vulnerability!
  await deleteLink(data.id);
  return { success: true };
}
```

---

## Data Layer Abstraction

### ✅ Correct: Use Helper Functions from /data

```tsx
// ✅ app/dashboard/actions.ts
'use server';

import { createLink, updateLink, deleteLink } from '@/data/links';

export async function createLinkAction(data: { url: string; slug: string }) {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const result = linkSchema.safeParse(data);
  if (!result.success) return { error: result.error.flatten() };

  // ✅ Use data layer helper
  const link = await createLink(userId, result.data);
  return { success: true, link };
}
```

### ✅ Data Helper Example

```tsx
// ✅ data/links.ts
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createLink(userId: string, data: { url: string; slug: string }) {
  const [link] = await db
    .insert(links)
    .values({
      ...data,
      userId,
      createdAt: new Date(),
    })
    .returning();

  return link;
}

export async function deleteLink(linkId: string, userId: string) {
  // Ensure user owns the link
  await db.delete(links).where(and(eq(links.id, linkId), eq(links.userId, userId)));
}
```

### ❌ Wrong: Direct Drizzle in Actions

```tsx
// ❌ app/dashboard/actions.ts
'use server';

import { db } from '@/db';
import { links } from '@/db/schema';

export async function createLinkAction(data: { url: string; slug: string }) {
  const { userId } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  // ❌ DON'T write Drizzle queries directly in Server Actions
  const [link] = await db
    .insert(links)
    .values({ ...data, userId })
    .returning();

  return { success: true, link };
}
```

---

## Error Handling Pattern

### ✅ Correct: Return Error Objects

```tsx
// ✅ app/dashboard/actions.ts
'use server';

export async function createLinkAction(data: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    // ✅ Return error object
    return { error: 'Unauthorized' };
  }

  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    // ✅ Return validation errors
    return { error: 'Validation failed', fieldErrors: validation.error.flatten().fieldErrors };
  }

  try {
    const link = await createLink(userId, validation.data);
    // ✅ Return success object
    return { success: true, link };
  } catch (error) {
    // ✅ Catch errors and return error object
    console.error('Failed to create link:', error);
    return { error: 'Failed to create link. Please try again.' };
  }
}
```

### ❌ Wrong: Throwing Errors

```tsx
// ❌ app/dashboard/actions.ts
'use server';

export async function createLinkAction(data: CreateLinkInput) {
  const { userId } = await auth();
  if (!userId) {
    // ❌ DON'T throw errors
    throw new Error('Unauthorized');
  }

  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    // ❌ DON'T throw validation errors
    throw new Error('Validation failed');
  }

  // ❌ DON'T let errors propagate uncaught
  const link = await createLink(userId, validation.data);
  return { success: true, link };
}
```

### Why Return Objects Instead of Throwing?

1. **Predictable Client Handling**: Client components can handle errors uniformly
2. **Type Safety**: Return types are explicit and checked by TypeScript
3. **Better UX**: Errors can be displayed in the UI without crashing
4. **Progressive Enhancement**: Form still works without JavaScript

---

## Complete Example

### Full Working Implementation

```tsx
// ✅ app/dashboard/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createLink } from '@/data/links';

const createLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug too long')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Invalid slug format'),
});

type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLinkAction(data: CreateLinkInput) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { error: 'You must be logged in to create links' };
  }

  // 2. Validate input with Zod
  const validation = createLinkSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: 'Validation failed',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // 3. Use data layer helper
  try {
    const link = await createLink(userId, validation.data);
    return { success: true, link };
  } catch (error) {
    console.error('Failed to create link:', error);
    return { error: 'Failed to create link. Please try again.' };
  }
}
```

```tsx
// ✅ app/dashboard/link-form.tsx
'use client';

import { useState } from 'react';
import { createLinkAction } from './actions';

export function LinkForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createLinkAction({
      url: formData.get('url') as string,
      slug: formData.get('slug') as string,
    });

    if (result.error) {
      setError(result.error);
    } else {
      console.log('Success:', result.link);
      e.currentTarget.reset();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="url" type="url" placeholder="https://example.com" required />
      <input name="slug" type="text" placeholder="my-link" required />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit">Create Link</button>
    </form>
  );
}
```

---

## Common Pitfalls

### ⚠️ Watch Out For

1. **Throwing Errors**: Never throw - always return `{ error }` or `{ success, data }` objects
2. **FormData Type**: Don't use TypeScript's `FormData` type for action parameters
3. **Missing 'use server'**: Always add `'use server'` directive at top of actions file
4. **Async Without Await**: Remember to await Server Actions in Client Components
5. **No Try-Catch**: Always wrap database calls in try-catch and return error objects
6. **Skipping Validation**: Even if client validates, always validate on server
7. **Direct DB Access**: Always use data layer helpers, never Drizzle directly

---

## Checklist

Before creating a Server Action, verify:

- [ ] File is named `actions.ts` and colocated with component
- [ ] File starts with `'use server'` directive
- [ ] Action checks authentication first
- [ ] Input validated with Zod schema
- [ ] Uses TypeScript types (not `FormData` or `any`)
- [ ] Calls data layer helper function
- [ ] Returns structured error/success response (never throws)
- [ ] All database calls wrapped in try-catch
- [ ] Called from Client Component with proper error handling
