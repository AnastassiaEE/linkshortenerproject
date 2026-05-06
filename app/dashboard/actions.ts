'use server';

import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { createLink, isShortCodeTaken, updateLink, deleteLink, getLinkById } from '@/data/links';
import { revalidatePath } from 'next/cache';

const linkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  shortCode: z
    .string()
    .min(3, 'Short code must be at least 3 characters')
    .max(50, 'Short code must be less than 50 characters')
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      'Short code can only contain letters, numbers, hyphens, and underscores',
    ),
});

export async function createLinkAction(data: { originalUrl: string; shortCode: string }) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized. Please sign in to create links.' };
  }

  // 2. Validate input
  const result = linkSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return {
      error: errors.originalUrl?.[0] || errors.shortCode?.[0] || 'Invalid input',
    };
  }

  // 3. Check if short code is already taken
  const isTaken = await isShortCodeTaken(result.data.shortCode);
  if (isTaken) {
    return { error: 'This short code is already taken. Please choose another one.' };
  }

  // 4. Create the link using data layer helper
  try {
    const link = await createLink(userId, result.data);

    // Revalidate the dashboard page to show the new link
    revalidatePath('/dashboard');

    return { success: true, link };
  } catch (error) {
    console.error('Error creating link:', error);
    return { error: 'Failed to create link. Please try again.' };
  }
}

export async function updateLinkAction(data: {
  id: string;
  originalUrl: string;
  shortCode: string;
}) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized. Please sign in to update links.' };
  }

  // 2. Validate input
  const result = linkSchema.safeParse({
    originalUrl: data.originalUrl,
    shortCode: data.shortCode,
  });
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    return {
      error: errors.originalUrl?.[0] || errors.shortCode?.[0] || 'Invalid input',
    };
  }

  // 3. Check if link exists and belongs to user
  const existingLink = await getLinkById(data.id);
  if (!existingLink) {
    return { error: 'Link not found.' };
  }
  if (existingLink.userId !== userId) {
    return { error: 'Unauthorized. You can only edit your own links.' };
  }

  // 4. Check if short code is taken by another link
  if (existingLink.shortCode !== result.data.shortCode) {
    const isTaken = await isShortCodeTaken(result.data.shortCode);
    if (isTaken) {
      return { error: 'This short code is already taken. Please choose another one.' };
    }
  }

  // 5. Update the link
  try {
    const link = await updateLink(data.id, userId, result.data);

    // Revalidate the dashboard page to show the updated link
    revalidatePath('/dashboard');

    return { success: true, link };
  } catch (error) {
    console.error('Error updating link:', error);
    return { error: 'Failed to update link. Please try again.' };
  }
}

export async function deleteLinkAction(linkId: string) {
  // 1. Check authentication
  const { userId } = await auth();
  if (!userId) {
    return { error: 'Unauthorized. Please sign in to delete links.' };
  }

  // 2. Check if link exists and belongs to user
  const existingLink = await getLinkById(linkId);
  if (!existingLink) {
    return { error: 'Link not found.' };
  }
  if (existingLink.userId !== userId) {
    return { error: 'Unauthorized. You can only delete your own links.' };
  }

  // 3. Delete the link
  try {
    await deleteLink(linkId);

    // Revalidate the dashboard page to remove the deleted link
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting link:', error);
    return { error: 'Failed to delete link. Please try again.' };
  }
}
