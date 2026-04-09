export type AssetKind = "mobile" | "desktop" | "gif";

export type AssetStatus = "draft" | "published" | "archived";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type CloudinaryResourceType = "image" | "video" | "raw";

export interface AssetRecord {
  id: string;
  source_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  kind: AssetKind;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  cloudinary_public_id: string | null;
  cloudinary_resource_type: CloudinaryResourceType | null;
  storage_bucket: string | null;
  storage_path: string | null;
  secure_url: string | null;
  original_url: string | null;
  status: AssetStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionRecord {
  id: string;
  status: SubmissionStatus;
  submitter_name: string | null;
  submitter_email: string | null;
  title: string;
  notes: string | null;
  kind: AssetKind;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  approved_asset_id: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRecord {
  id: string;
  user_id: string;
  email: string;
  role: "admin";
  created_at: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface GalleryStats {
  totalAssets: number;
  totalMobile: number;
  totalDesktop: number;
  totalGif: number;
}

export interface ChiikawaParsedAsset {
  sourceId: string;
  title: string;
  originalUrl: string;
  previewUrl: string;
  srcSet: string[];
  kind: AssetKind;
  featured: boolean;
  resolutionTag: string | null;
}
