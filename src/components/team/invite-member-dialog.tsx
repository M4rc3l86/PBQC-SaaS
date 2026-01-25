"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/validations/organization";
import { sendInvitation } from "@/lib/auth/invite";

interface TeamInviteDialogProps {
  orgId: string;
}

export function TeamInviteDialog({ orgId }: TeamInviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "worker",
    },
  });

  async function onSubmit(data: InviteMemberInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await sendInvitation({
      email: data.email,
      role: data.role,
      orgId,
    });

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: "Einladung erfolgreich gesendet an " + data.email,
      });
      form.reset();
      setTimeout(() => setIsOpen(false), 1500);
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Einladen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mitglied einladen</DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladung an ein neues Teammitglied
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select
              value={form.getValues("role")}
              onValueChange={(value) =>
                form.setValue("role", value as "manager" | "worker")
              }
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">Mitarbeiter</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Einladen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
