import { getLinkByShortCode } from '@/data/links';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  // Fetch the link from the database
  const link = await getLinkByShortCode(shortCode);

  // If link not found, return 404
  if (!link) {
    return new Response('Link not found', { status: 404 });
  }

  // Redirect to the original URL
  return Response.redirect(link.originalUrl, 301);
}
