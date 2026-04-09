import { ADMIN_PAGE_SIZE, PENDING_BUCKET } from "@/lib/constants";
import { isServiceSupabaseConfigured } from "@/lib/env";
import { mockSubmissions } from "@/lib/mock/assets";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { PagedResult, SubmissionRecord } from "@/lib/types";
import { paginateArray } from "@/lib/utils";

function normalizeSubmission(row: Partial<SubmissionRecord>): SubmissionRecord {
  return {
    id: String(row.id ?? ""),
    status: row.status ?? "pending",
    submitter_name: row.submitter_name ?? null,
    submitter_email: row.submitter_email ?? null,
    title: row.title ?? "",
    notes: row.notes ?? null,
    kind: row.kind ?? "mobile",
    storage_path: row.storage_path ?? "",
    mime_type: row.mime_type ?? "",
    size_bytes: row.size_bytes ?? 0,
    approved_asset_id: row.approved_asset_id ?? null,
    review_note: row.review_note ?? null,
    reviewed_at: row.reviewed_at ?? null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

export async function createPendingUpload(path: string) {
  if (!isServiceSupabaseConfigured()) {
    return { path, token: "mock-token" };
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.storage
    .from(PENDING_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw error ?? new Error("Unable to create signed upload URL.");
  }

  return data;
}

export async function createSubmission(input: {
  title: string;
  notes?: string | null;
  kind: SubmissionRecord["kind"];
  submitterName?: string | null;
  submitterEmail?: string | null;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}) {
  if (!isServiceSupabaseConfigured()) {
    const submission = normalizeSubmission({
      id: `mock-${Date.now()}`,
      status: "pending",
      submitter_name: input.submitterName ?? null,
      submitter_email: input.submitterEmail ?? null,
      title: input.title,
      notes: input.notes ?? null,
      kind: input.kind,
      storage_path: input.storagePath,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
    });

    return submission;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      status: "pending",
      submitter_name: input.submitterName ?? null,
      submitter_email: input.submitterEmail ?? null,
      title: input.title,
      notes: input.notes ?? null,
      kind: input.kind,
      storage_path: input.storagePath,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeSubmission(data);
}

export async function getAdminSubmissionsPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE
) {
  if (!isServiceSupabaseConfigured()) {
    return paginateArray(mockSubmissions, page, pageSize) as PagedResult<SubmissionRecord>;
  }

  const supabase = getSupabaseServiceClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    items: (data ?? []).map((item) => normalizeSubmission(item)),
    total: count ?? 0,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  } satisfies PagedResult<SubmissionRecord>;
}

export async function getSubmissionById(id: string) {
  if (!isServiceSupabaseConfigured()) {
    return mockSubmissions.find((submission) => submission.id === id) ?? null;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? normalizeSubmission(data) : null;
}
