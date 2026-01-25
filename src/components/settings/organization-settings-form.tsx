"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateOrganizationSchema,
  type UpdateOrganizationInput,
} from "@/lib/validations/organization";
import { updateOrganization } from "@/lib/organization/actions";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface OrganizationSettingsFormProps {
  organizationId: string;
  initialName: string;
  ownerEmail: string;
  createdAt: string;
}

export function OrganizationSettingsForm({
  organizationId,
  initialName,
  ownerEmail,
  createdAt,
}: OrganizationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<UpdateOrganizationInput>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: { name: initialName },
  });

  async function onSubmit(data: UpdateOrganizationInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await updateOrganization(organizationId, data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Organisation aktualisiert" });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
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
        <Label htmlFor="name">Name der Organisation</Label>
        <Input
          id="name"
          {...form.register("name")}
          disabled={isLoading}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Inhaber</Label>
        <p className="text-sm text-muted-foreground">{ownerEmail}</p>
      </div>

      <div className="space-y-2">
        <Label>Erstellt am</Label>
        <p className="text-sm text-muted-foreground">
          {format(new Date(createdAt), "PPP", { locale: de })}
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Speichern
      </Button>
    </form>
  );
}
