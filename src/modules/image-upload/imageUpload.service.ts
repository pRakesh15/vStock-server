import { generatePresignedUrl } from "../../utils/aws/presignedUrl";
import type { GenerateImageUploadInput } from "./imageUpload.schema";

export class ImageUploadService {
  async generateUploadUrl(
    userId: string | undefined,
    data: GenerateImageUploadInput
  ) {
    return generatePresignedUrl({
      fileName: data.fileName,
      fileType: data.fileType,
      ...(userId && { userId }),
    });
  }
}

export const imageUploadService = new ImageUploadService();
