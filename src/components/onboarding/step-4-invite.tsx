"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/lib/validations/organization";
import { sendInvitation } from "@/lib/auth/invite";

interface Step4InviteProps {
  organizationId: string;
  onComplete: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function Step4Invite({
  organizationId,
  onComplete,
  onBack,
  onSkip,
}: Step4InviteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: "", role: "worker" },
  });

  async function onSubmit(data: InviteMemberInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await sendInvitation({
      orgId: organizationId,
      email: data.email,
      role: "worker",
    });

    if (result.error) {
      setMessage({ type: "error", text: result.error });
      setIsLoading(false);
    } else {
      setMessage({
        type: "success",
        text: `Einladung an ${data.email} gesendet!`,
      });
      // Auto-advance after success
      setTimeout(() => onComplete(), 1500);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Mitarbeiter einladen</h2>
        <p className="text-sm text-muted-foreground">
          Laden Sie Ihre ersten Mitarbeiter ein (optional)
        </p>
      </div>

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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input
            id="email"
            type="email"
            placeholder="mitarbeiter@example.com"
            {...form.register("email")}
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Einladung senden
          </Button>
        </div>
      </form>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Zurück
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onSkip}
          disabled={isLoading}
          className="flex-1"
        >
          Überspringen
        </Button>
      </div>
    </div>
  );
}
