'use client';

import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function SignUpButtonComponent() {
  return (
    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
      <Button>Sign up</Button>
    </SignUpButton>
  );
}
