import { z } from "zod";

export const idSchema = z.coerce.number().int().positive();

const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "target_url must be a valid http(s) URL",
  });

export const codeSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{3,16}$/, {
    message:
      "code must be 3-16 characters of letters, numbers, underscores, or dashes",
  });

export const createLinkSchema = z
  .object({
    target_url: httpUrlSchema,
    code: codeSchema.optional(),
    expires_at: z.union([z.string().datetime(), z.date()]).optional(),
  })
  .strict();

export const codeParamSchema = codeSchema;

export const clickLogQuerySchema = z.object({
  after: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
