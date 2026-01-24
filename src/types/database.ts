export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ENUM Types
export type OrgRole = "owner" | "manager" | "worker";
export type MemberStatus = "invited" | "active" | "inactive";
export type ItemType = "checkbox" | "text" | "number" | "photo_only";
export type JobStatus =
  | "scheduled"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected"
  | "cancelled";
export type ItemResultStatus = "pass" | "fail" | "na" | "pending";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";
export type PlanType = "starter" | "pro";

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
          stripe_customer_id: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
          stripe_customer_id?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          email: string;
          role: OrgRole;
          status: MemberStatus;
          invited_at: string;
          joined_at: string | null;
          invitation_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          email: string;
          role?: OrgRole;
          status?: MemberStatus;
          invited_at?: string;
          joined_at?: string | null;
          invitation_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          email?: string;
          role?: OrgRole;
          status?: MemberStatus;
          invited_at?: string;
          joined_at?: string | null;
          invitation_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "org_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sites: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          address: string | null;
          timezone: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          address?: string | null;
          timezone?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          address?: string | null;
          timezone?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sites_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_templates_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      checklist_items: {
        Row: {
          id: string;
          template_id: string;
          parent_id: string | null;
          title: string;
          description: string | null;
          item_type: ItemType;
          requires_photo: boolean;
          requires_note: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          parent_id?: string | null;
          title: string;
          description?: string | null;
          item_type?: ItemType;
          requires_photo?: boolean;
          requires_note?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          parent_id?: string | null;
          title?: string;
          description?: string | null;
          item_type?: ItemType;
          requires_photo?: boolean;
          requires_note?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklist_items_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "checklist_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklist_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "checklist_items";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          org_id: string;
          site_id: string;
          template_id: string;
          assigned_to: string | null;
          status: JobStatus;
          scheduled_date: string;
          started_at: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          review_comment: string | null;
          quick_mode_used: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          site_id: string;
          template_id: string;
          assigned_to?: string | null;
          status?: JobStatus;
          scheduled_date: string;
          started_at?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_comment?: string | null;
          quick_mode_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          site_id?: string;
          template_id?: string;
          assigned_to?: string | null;
          status?: JobStatus;
          scheduled_date?: string;
          started_at?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_comment?: string | null;
          quick_mode_used?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_site_id_fkey";
            columns: ["site_id"];
            isOneToOne: false;
            referencedRelation: "sites";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "checklist_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "org_members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "org_members";
            referencedColumns: ["id"];
          },
        ];
      };
      job_item_results: {
        Row: {
          id: string;
          job_id: string;
          item_id: string;
          status: ItemResultStatus;
          note: string | null;
          number_value: number | null;
          text_value: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          item_id: string;
          status?: ItemResultStatus;
          note?: string | null;
          number_value?: number | null;
          text_value?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          item_id?: string;
          status?: ItemResultStatus;
          note?: string | null;
          number_value?: number | null;
          text_value?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_item_results_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_item_results_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "checklist_items";
            referencedColumns: ["id"];
          },
        ];
      };
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          item_id: string | null;
          storage_path: string;
          caption: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          item_id?: string | null;
          storage_path: string;
          caption?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          item_id?: string | null;
          storage_path?: string;
          caption?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_photos_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "checklist_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "org_members";
            referencedColumns: ["id"];
          },
        ];
      };
      job_comments: {
        Row: {
          id: string;
          job_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_comments_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "org_members";
            referencedColumns: ["id"];
          },
        ];
      };
      client_shares: {
        Row: {
          id: string;
          job_id: string;
          token: string;
          pdf_storage_path: string | null;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          token: string;
          pdf_storage_path?: string | null;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          token?: string;
          pdf_storage_path?: string | null;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_shares_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_subscriptions: {
        Row: {
          id: string;
          org_id: string;
          stripe_subscription_id: string | null;
          plan: PlanType;
          status: SubscriptionStatus;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          canceled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          stripe_subscription_id?: string | null;
          plan?: PlanType;
          status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          stripe_subscription_id?: string | null;
          plan?: PlanType;
          status?: SubscriptionStatus;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_org_ids: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      get_user_role: {
        Args: {
          p_org_id: string;
        };
        Returns: OrgRole | null;
      };
      is_org_admin: {
        Args: {
          p_org_id: string;
        };
        Returns: boolean;
      };
      is_org_owner: {
        Args: {
          p_org_id: string;
        };
        Returns: boolean;
      };
      get_user_member_id: {
        Args: {
          p_org_id: string;
        };
        Returns: string | null;
      };
    };
    Enums: {
      org_role: OrgRole;
      member_status: MemberStatus;
      item_type: ItemType;
      job_status: JobStatus;
      item_result_status: ItemResultStatus;
      subscription_status: SubscriptionStatus;
      plan_type: PlanType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience types for easier use
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];
export type OrganizationUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

export type OrgMember = Database["public"]["Tables"]["org_members"]["Row"];
export type OrgMemberInsert =
  Database["public"]["Tables"]["org_members"]["Insert"];
export type OrgMemberUpdate =
  Database["public"]["Tables"]["org_members"]["Update"];

export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type SiteInsert = Database["public"]["Tables"]["sites"]["Insert"];
export type SiteUpdate = Database["public"]["Tables"]["sites"]["Update"];

export type ChecklistTemplate =
  Database["public"]["Tables"]["checklist_templates"]["Row"];
export type ChecklistTemplateInsert =
  Database["public"]["Tables"]["checklist_templates"]["Insert"];
export type ChecklistTemplateUpdate =
  Database["public"]["Tables"]["checklist_templates"]["Update"];

export type ChecklistItem =
  Database["public"]["Tables"]["checklist_items"]["Row"];
export type ChecklistItemInsert =
  Database["public"]["Tables"]["checklist_items"]["Insert"];
export type ChecklistItemUpdate =
  Database["public"]["Tables"]["checklist_items"]["Update"];

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
export type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

export type JobItemResult =
  Database["public"]["Tables"]["job_item_results"]["Row"];
export type JobItemResultInsert =
  Database["public"]["Tables"]["job_item_results"]["Insert"];
export type JobItemResultUpdate =
  Database["public"]["Tables"]["job_item_results"]["Update"];

export type JobPhoto = Database["public"]["Tables"]["job_photos"]["Row"];
export type JobPhotoInsert =
  Database["public"]["Tables"]["job_photos"]["Insert"];
export type JobPhotoUpdate =
  Database["public"]["Tables"]["job_photos"]["Update"];

export type JobComment = Database["public"]["Tables"]["job_comments"]["Row"];
export type JobCommentInsert =
  Database["public"]["Tables"]["job_comments"]["Insert"];
export type JobCommentUpdate =
  Database["public"]["Tables"]["job_comments"]["Update"];

export type ClientShare = Database["public"]["Tables"]["client_shares"]["Row"];
export type ClientShareInsert =
  Database["public"]["Tables"]["client_shares"]["Insert"];
export type ClientShareUpdate =
  Database["public"]["Tables"]["client_shares"]["Update"];

export type BillingSubscription =
  Database["public"]["Tables"]["billing_subscriptions"]["Row"];
export type BillingSubscriptionInsert =
  Database["public"]["Tables"]["billing_subscriptions"]["Insert"];
export type BillingSubscriptionUpdate =
  Database["public"]["Tables"]["billing_subscriptions"]["Update"];
