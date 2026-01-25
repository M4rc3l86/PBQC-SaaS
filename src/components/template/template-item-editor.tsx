"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { ChecklistItemForm } from "./checklist-item-form";
import {
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
} from "@/lib/template/actions";

// Item type labels
const itemTypeLabels: Record<string, string> = {
  checkbox: "Checkbox",
  text: "Text",
  number: "Zahl",
  photo_only: "Nur Foto",
};

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  item_type: string;
  requires_photo: boolean;
  requires_note: boolean;
  sort_order: number;
}

interface TemplateItemEditorProps {
  templateId: string;
  initialItems: ChecklistItem[];
}

export function TemplateItemEditor({
  templateId,
  initialItems,
}: TemplateItemEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(
    initialItems.sort((a, b) => a.sort_order - b.sort_order)
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    router.refresh();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleEdit = (item: ChecklistItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;

    const result = await deleteChecklistItem(deleteItemId);
    if (result.success) {
      setDeleteItemId(null);
      router.refresh();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newItems = [...items];
    const temp = newItems[index].sort_order;
    newItems[index].sort_order = newItems[index - 1].sort_order;
    newItems[index - 1].sort_order = temp;

    // Reorder in state
    const reorderedItems = [...newItems];
    const itemToMove = reorderedItems[index];
    reorderedItems.splice(index, 1);
    reorderedItems.splice(index - 1, 0, itemToMove);

    setItems(reorderedItems);

    // Update in database
    await reorderChecklistItems(templateId, {
      items: reorderedItems.map((item) => ({
        id: item.id,
        sort_order: item.sort_order,
      })),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;

    const newItems = [...items];
    const temp = newItems[index].sort_order;
    newItems[index].sort_order = newItems[index + 1].sort_order;
    newItems[index + 1].sort_order = temp;

    // Reorder in state
    const reorderedItems = [...newItems];
    const itemToMove = reorderedItems[index];
    reorderedItems.splice(index, 1);
    reorderedItems.splice(index + 1, 0, itemToMove);

    setItems(reorderedItems);

    // Update in database
    await reorderChecklistItems(templateId, {
      items: reorderedItems.map((item) => ({
        id: item.id,
        sort_order: item.sort_order,
      })),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Checklisten-Elemente</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Element hinzufügen
        </Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg border-dashed">
          <p className="text-muted-foreground text-center">
            Noch keine Elemente vorhanden. Fügen Sie Ihr erstes Element hinzu.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 flex items-start gap-4 hover:bg-muted/50"
            >
              {/* Sort Order Badge */}
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-sm font-medium shrink-0">
                {index + 1}
              </div>

              {/* Item Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-medium">{item.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {itemTypeLabels[item.item_type] || item.item_type}
                  </Badge>
                  {item.requires_photo && (
                    <Badge variant="secondary" className="text-xs">
                      Foto
                    </Badge>
                  )}
                  {item.requires_note && (
                    <Badge variant="secondary" className="text-xs">
                      Notiz
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  title="Nach oben"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  title="Nach unten"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(item)}
                  title="Bearbeiten"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteItemId(item.id)}
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Element hinzufügen</DialogTitle>
            <DialogDescription>
              Fügen Sie ein neues Element zur Checkliste hinzu
            </DialogDescription>
          </DialogHeader>
          <ChecklistItemForm
            templateId={templateId}
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Element bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie das Checklisten-Element
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <ChecklistItemForm
              templateId={templateId}
              itemId={editingItem.id}
              initialData={{
                ...editingItem,
                item_type: editingItem.item_type as any,
                description: editingItem.description ?? undefined,
              }}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Element löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Element löschen möchten? Diese
              Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
