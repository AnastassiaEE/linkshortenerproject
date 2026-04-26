'use client';

import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function SignInButtonComponent() {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <Button variant="ghost">Sign in</Button>
    </SignInButton>
  );
}
