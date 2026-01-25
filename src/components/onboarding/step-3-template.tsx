"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createTemplateSchema,
  type CreateTemplateInput,
} from "@/lib/validations/template";
import { createTemplate, addChecklistItem } from "@/lib/template/actions";

interface ChecklistItem {
  title: string;
  description: string;
  requires_photo: boolean;
}

interface Step3TemplateProps {
  organizationId: string;
  onComplete: (templateId: string) => void;
  onBack: () => void;
}

export function Step3Template({
  organizationId,
  onComplete,
  onBack,
}: Step3TemplateProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([
    { title: "", description: "", requires_photo: true },
  ]);

  const form = useForm<CreateTemplateInput>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: { name: "", description: "" },
  });

  function addItem() {
    setItems([
      ...items,
      { title: "", description: "", requires_photo: true },
    ]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(
    index: number,
    field: keyof ChecklistItem,
    value: string | boolean,
  ) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  async function onSubmit(data: CreateTemplateInput) {
    // Validate items
    const validItems = items.filter((item) => item.title.trim() !== "");

    if (validItems.length === 0) {
      setMessage({ type: "error", text: "Mindestens ein Eintrag erforderlich" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const result = await createTemplate(organizationId, data);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
      setIsLoading(false);
      return;
    }

    if (result?.success) {
      // Add items to the template using server action
      for (const item of validItems) {
        await addChecklistItem(result.data.id, {
          title: item.title,
          description: item.description || undefined,
          item_type: "checkbox", // Default to checkbox for onboarding
          requires_photo: item.requires_photo,
          requires_note: false,
          sort_order: 0, // Will be auto-calculated
        });
      }

      onComplete(result.data.id);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Erste Checkliste erstellen</h2>
        <p className="text-sm text-muted-foreground">
          Erstellen Sie eine Vorlage für Ihre Qualitätskontrollen
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
        <Label htmlFor="name">Name der Checkliste</Label>
        <Input
          id="name"
          placeholder="Standardreinigung Büro"
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
          placeholder="Standardreinigung für Büros"
          rows={2}
          {...form.register("description")}
          disabled={isLoading}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Checklistenpunkte</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Hinzufügen
          </Button>
        </div>

        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 border rounded-md space-y-2 relative"
          >
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                disabled={isLoading}
                className="absolute top-2 right-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            <div className="pr-8">
              <Input
                placeholder="Titel des Punktes"
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Textarea
              placeholder="Beschreibung (optional)"
              value={item.description}
              onChange={(e) =>
                updateItem(index, "description", e.target.value)
              }
              rows={1}
              disabled={isLoading}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`photo-${index}`}
                checked={item.requires_photo}
                onCheckedChange={(checked) =>
                  updateItem(index, "requires_photo", checked as boolean)
                }
                disabled={isLoading}
              />
              <Label htmlFor={`photo-${index}`} className="text-sm">
                Foto erforderlich
              </Label>
            </div>
          </div>
        ))}
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
