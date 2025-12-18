import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, getS3Config } from "./s3Client";

export interface PresignedUrlOptions {
  fileName: string;
  fileType: string;
  userId?: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function generatePresignedUrl(
  options: PresignedUrlOptions
): Promise<PresignedUrlResponse> {
  try {
    const s3Client = getS3Client();
    const config = getS3Config();

    const timestamp = Date.now();
    const userPrefix = options.userId ? `user-${options.userId}/` : "";
    const key = `${userPrefix}${timestamp}-${options.fileName}`;

    const command = new PutObjectCommand({
      Bucket: config.S3_BUCKET_NAME,
      Key: key,
      ContentType: options.fileType,
      Metadata: {
        uploaded_by: options.userId ?? "unknown",
        original_name: options.fileName,
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    const publicUrl = `https://${config.S3_BUCKET_NAME}.s3.${config.S3_REGION}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    throw new Error("Failed to generate upload URL");
  }
}
