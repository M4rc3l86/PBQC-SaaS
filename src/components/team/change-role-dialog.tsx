"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole } from "@/lib/organization/actions";

// Role labels
const roleLabels: Record<string, string> = {
  owner: "Inhaber",
  manager: "Manager",
  worker: "Mitarbeiter",
};

interface ChangeRoleDialogProps {
  memberId: string;
  currentRole: string;
  memberEmail: string;
}

export function ChangeRoleDialog({
  memberId,
  currentRole,
  memberEmail,
}: ChangeRoleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);

  async function handleSave() {
    if (selectedRole === currentRole) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await updateMemberRole(memberId, { role: selectedRole as any });

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: "Rolle erfolgreich geändert",
      });
      setTimeout(() => setIsOpen(false), 1000);
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Rolle ändern
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rolle ändern</DialogTitle>
          <DialogDescription>
            Ändern Sie die Rolle von {memberEmail}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {message && (
            <div
              className={`p-3 rounded-md text-sm border-l-4 ${
                message.type === "error"
                  ? "bg-destructive/10 text-destructive border-l-destructive"
                  : "bg-primary/10 text-primary border-l-primary"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Neue Rolle</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Inhaber</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="worker">Mitarbeiter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isLoading || selectedRole === currentRole}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
