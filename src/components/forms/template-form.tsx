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
import { createTemplateSchema, type CreateTemplateInput } from "@/lib/validations/template";
import { createTemplate, updateTemplate } from "@/lib/template/actions";

interface TemplateFormProps {
  initialData?: Partial<CreateTemplateInput> & { id?: string };
  templateId?: string;
  orgId: string;
  cancelUrl?: string;
}

export function TemplateForm({
  initialData,
  templateId,
  orgId,
  cancelUrl,
}: TemplateFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = !!templateId;

  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  async function onSubmit(data: CreateTemplateInput) {
    setIsLoading(true);
    setMessage(null);

    // Handle empty string as undefined for optional description
    const submitData = {
      ...data,
      description: data.description || undefined,
    };

    const result = isEditing
      ? await updateTemplate(templateId!, submitData)
      : await createTemplate(orgId, submitData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result?.data) {
      if (isEditing) {
        setMessage({
          type: "success",
          text: "Vorlage aktualisiert",
        });
      } else {
        router.push(`/templates/${result.data.id}/edit`);
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
        <Label htmlFor="name">Name der Vorlage *</Label>
        <Input
          id="name"
          placeholder="Büroreinigung Standard"
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
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea
          id="description"
          placeholder="Standard-Checkliste für die tägliche Büroreinigung"
          rows={3}
          {...form.register("description")}
          disabled={isLoading}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
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
