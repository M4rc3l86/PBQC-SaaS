"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSiteSchema, type CreateSiteInput } from "@/lib/validations/site";
import { createSite } from "@/lib/site/actions";

interface Step2SiteProps {
  organizationId: string;
  onComplete: (siteId: string) => void;
  onBack: () => void;
}

export function Step2Site({
  organizationId,
  onComplete,
  onBack,
}: Step2SiteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  async function onSubmit(data: CreateSiteInput) {
    setIsLoading(true);
    setMessage(null);

    const result = await createSite(organizationId, data);

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
        <h2 className="text-xl font-semibold">Ersten Standort erstellen</h2>
        <p className="text-sm text-muted-foreground">
          Fügen Sie Ihren ersten Standort hinzu, an dem Aufträge ausgeführt
          werden
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
        <Label htmlFor="name">Name des Standorts</Label>
        <Input
          id="name"
          placeholder="Bürogebäude Hauptstraße"
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
        <Label htmlFor="address">Adresse (optional)</Label>
        <Textarea
          id="address"
          placeholder="Hauptstraße 1, 12345 Musterstadt"
          rows={2}
          {...form.register("address")}
          disabled={isLoading}
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

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
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Weiter
        </Button>
      </div>
    </form>
  );
}
