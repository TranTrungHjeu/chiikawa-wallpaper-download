import { z } from "zod";

import { MAX_UPLOAD_BYTES, SUPPORTED_MIME_TYPES } from "@/lib/constants";

export const assetKindSchema = z.enum(["mobile", "desktop", "gif"]);

export const uploadUrlRequestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  kind: assetKindSchema,
  fileName: z.string().trim().min(1).max(180),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  contentType: z.string().refine((value) => SUPPORTED_MIME_TYPES.includes(value), {
    message: "Unsupported file type.",
  }),
  submitterName: z.string().trim().max(60).optional().nullable(),
  submitterEmail: z
    .string()
    .email()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal("")),
  honeypot: z.string().max(0).optional().default(""),
  turnstileToken: z.string().min(1).optional().nullable(),
});

export const completeSubmissionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  notes: z.string().trim().max(1000).optional().nullable(),
  kind: assetKindSchema,
  submitterName: z.string().trim().max(60).optional().nullable(),
  submitterEmail: z
    .string()
    .email()
    .max(120)
    .optional()
    .nullable()
    .or(z.literal("")),
  storagePath: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

export const rejectSubmissionSchema = z.object({
  reason: z.string().trim().min(3).max(240),
});
