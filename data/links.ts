import { db } from '@/db';
import { links } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Get all links for a specific user
 */
export async function getUserLinks(userId: string) {
  return await db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

/**
 * Create a new shortened link
 */
export async function createLink(userId: string, data: { originalUrl: string; shortCode: string }) {
  const [link] = await db
    .insert(links)
    .values({
      userId,
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
    })
    .returning();

  return link;
}

/**
 * Check if a short code already exists
 */
export async function isShortCodeTaken(shortCode: string): Promise<boolean> {
  const [existing] = await db.select().from(links).where(eq(links.shortCode, shortCode)).limit(1);

  return !!existing;
}

/**
 * Get a single link by ID
 */
export async function getLinkById(linkId: string) {
  const [link] = await db.select().from(links).where(eq(links.id, linkId)).limit(1);

  return link;
}

/**
 * Update an existing link
 */
export async function updateLink(
  linkId: string,
  userId: string,
  data: { originalUrl: string; shortCode: string },
) {
  const [link] = await db
    .update(links)
    .set({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
    })
    .where(eq(links.id, linkId))
    .returning();

  return link;
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string) {
  await db.delete(links).where(eq(links.id, linkId));
}

/**
 * Get a link by short code
 */
export async function getLinkByShortCode(shortCode: string) {
  const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode)).limit(1);

  return link;
}
