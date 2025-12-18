import { z } from "zod";

export const generateImageUploadSchema = z.object({
  fileName: z.string().min(1, "fileName is required"),
  fileType: z
    .string()
    .regex(/^image\/(jpeg|png|jpg|webp)$/i, "Invalid image type"),
});

export type GenerateImageUploadInput = z.infer<
  typeof generateImageUploadSchema
>;
