"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeRoleDialog } from "./change-role-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

interface TeamActionsProps {
  memberId: string;
  memberEmail: string;
  currentRole: string;
  canChangeRole?: boolean;
  canRemove?: boolean;
}

export function TeamActions({
  memberId,
  memberEmail,
  currentRole,
  canChangeRole = true,
  canRemove = true,
}: TeamActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {canChangeRole && <ChangeRoleDialog memberId={memberId} currentRole={currentRole} memberEmail={memberEmail} />}
      {canRemove && <RemoveMemberDialog memberId={memberId} memberEmail={memberEmail} />}
    </div>
  );
}
