'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteLinkAction } from './actions';

interface DeleteLinkDialogProps {
  linkId: string;
  shortCode: string;
  children: React.ReactNode;
}

export function DeleteLinkDialog({ linkId, shortCode, children }: DeleteLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    const result = await deleteLinkAction(linkId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Link</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this link? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium">Short code: /{shortCode}</p>
          </div>
          {error && <div className="mt-4 text-sm text-destructive font-medium">{error}</div>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
