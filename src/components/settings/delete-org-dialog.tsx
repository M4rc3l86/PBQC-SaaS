"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteOrganization } from "@/lib/organization/actions";

interface DeleteOrgDialogProps {
  organizationId: string;
  organizationName: string;
}

export function DeleteOrgDialog({
  organizationId,
  organizationName,
}: DeleteOrgDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === organizationName;

  async function handleDelete() {
    if (!canDelete) return;

    setIsLoading(true);
    setError(null);

    const result = await deleteOrganization(organizationId);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // If successful, redirect will happen in server action
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Organisation löschen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Organisation löschen?
          </DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten
            einschließlich Aufträge, Fotos und Berichte werden permanent gelöscht.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-md text-sm bg-destructive/10 text-destructive border-l-4 border-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Geben Sie <strong>{organizationName}</strong> ein, um zu
              bestätigen
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={organizationName}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Organisation löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
