"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSiteSchema, type CreateSiteInput } from "@/lib/validations/site";
import { createSite, updateSite } from "@/lib/site/actions";

// Common timezones for German/European region
const TIMEZONES = [
  "Europe/Berlin",
  "Europe/Vienna",
  "Europe/Zurich",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Paris",
  "Europe/London",
  "Europe/Rome",
  "Europe/Madrid",
  "UTC",
];

interface SiteFormProps {
  initialData?: Partial<CreateSiteInput> & { id?: string };
  siteId?: string;
  orgId: string;
  cancelUrl?: string;
}

export function SiteForm({
  initialData,
  siteId,
  orgId,
  cancelUrl,
}: SiteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = !!siteId;

  const form = useForm<CreateSiteInput>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      timezone: initialData?.timezone || "Europe/Berlin",
    },
  });

  async function onSubmit(data: CreateSiteInput) {
    setIsLoading(true);
    setMessage(null);

    const result = isEditing
      ? await updateSite(siteId!, data)
      : await createSite(orgId, data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.data) {
      if (isEditing) {
        setMessage({ type: "success", text: "Standort aktualisiert" });
      } else {
        router.push(`/sites/${result.data.id}/edit`);
      }
    }

    setIsLoading(false);
  }

  return (
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
        <Label htmlFor="name">Name des Standorts *</Label>
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

      <div className="space-y-2">
        <Label htmlFor="timezone">Zeitzone</Label>
        <Select
          defaultValue={form.getValues("timezone")}
          onValueChange={(value) => form.setValue("timezone", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="timezone">
            <SelectValue placeholder="Zeitzone auswählen" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.timezone && (
          <p className="text-sm text-destructive">
            {form.formState.errors.timezone.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {cancelUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelUrl)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Speichern" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
