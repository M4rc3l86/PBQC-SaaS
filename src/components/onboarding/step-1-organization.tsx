"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createOrganizationSchema,
  type CreateOrganizationInput,
} from "@/lib/validations/organization";
import { createOrganization } from "@/lib/organization/actions";

interface Step1OrganizationProps {
  onComplete: (orgId: string) => void;
}

export function Step1Organization({ onComplete }: Step1OrganizationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(data: CreateOrganizationInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await createOrganization(data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.success) {
      onComplete(result.data.id);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Organisation erstellen</h2>
        <p className="text-sm text-muted-foreground">
          Geben Sie den Namen Ihrer Organisation ein
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

      <div className="space-y-2">
        <Label htmlFor="name">Name der Organisation</Label>
        <Input
          id="name"
          placeholder="Meine Gebäudereinigung GmbH"
          {...form.register("name")}
          disabled={isLoading}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Weiter
      </Button>
    </form>
  );
}
