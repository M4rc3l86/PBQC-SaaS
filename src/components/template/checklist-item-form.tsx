"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createChecklistItemSchema,
  type CreateChecklistItemInput,
  type UpdateChecklistItemInput,
} from "@/lib/validations/template";
import {
  addChecklistItem,
  updateChecklistItem,
} from "@/lib/template/actions";

// Item type labels
const ITEM_TYPES = [
  { value: "checkbox", label: "Checkbox" },
  { value: "text", label: "Text" },
  { value: "number", label: "Zahl" },
  { value: "photo_only", label: "Nur Foto" },
] as const;

interface ChecklistItemFormProps {
  templateId: string;
  initialData?: Partial<CreateChecklistItemInput> & { id?: string };
  itemId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ChecklistItemForm({
  templateId,
  initialData,
  itemId,
  onSuccess,
  onCancel,
}: ChecklistItemFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEditing = !!itemId;

  const form = useForm({
    resolver: zodResolver(createChecklistItemSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      item_type: initialData?.item_type || "checkbox",
      requires_photo: initialData?.requires_photo ?? false,
      requires_note: initialData?.requires_note ?? false,
      sort_order: initialData?.sort_order ?? 0,
      parent_id: initialData?.parent_id,
    },
  });

  const requiresPhoto = useWatch({
    control: form.control,
    name: "requires_photo",
  });
  const requiresNote = useWatch({
    control: form.control,
    name: "requires_note",
  });

  async function onSubmit(data: CreateChecklistItemInput) {
    setIsLoading(true);
    setMessage(null);

    const submitData = {
      ...data,
      description: data.description || undefined,
    };

    const result = isEditing
      ? await updateChecklistItem(itemId!, submitData as UpdateChecklistItemInput)
      : await addChecklistItem(templateId, submitData);

    if (result?.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({
        type: "success",
        text: isEditing ? "Element aktualisiert" : "Element hinzugefügt",
      });
      if (onSuccess) {
        setTimeout(() => onSuccess(), 500);
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
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          placeholder="z.B. Fenster reinigen"
          {...form.register("title")}
          disabled={isLoading}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">
            {String(form.formState.errors.title.message || "")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea
          id="description"
          placeholder="z.B. Alle Fenster von innen reinigen"
          rows={2}
          {...form.register("description")}
          disabled={isLoading}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {String(form.formState.errors.description.message || "")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="item_type">Elementtyp *</Label>
        <Select
          value={form.getValues("item_type")}
          onValueChange={(value) =>
            form.setValue("item_type", value as "checkbox" | "text" | "number" | "photo_only")
          }
          disabled={isLoading}
        >
          <SelectTrigger id="item_type">
            <SelectValue placeholder="Elementtyp auswählen" />
          </SelectTrigger>
          <SelectContent>
            {ITEM_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.item_type && (
          <p className="text-sm text-destructive">
            {String(form.formState.errors.item_type.message || "")}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires_photo"
            checked={requiresPhoto}
            onCheckedChange={(checked) =>
              form.setValue("requires_photo", checked as boolean)
            }
            disabled={isLoading}
          />
          <Label htmlFor="requires_photo" className="cursor-pointer">
            Foto erforderlich
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="requires_note"
            checked={requiresNote}
            onCheckedChange={(checked) =>
              form.setValue("requires_note", checked as boolean)
            }
            disabled={isLoading}
          />
          <Label htmlFor="requires_note" className="cursor-pointer">
            Notiz erforderlich
          </Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Aktualisieren" : "Hinzufügen"}
        </Button>
      </div>
    </form>
  );
}
