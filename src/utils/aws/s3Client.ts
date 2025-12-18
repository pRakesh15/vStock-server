import { S3Client } from "@aws-sdk/client-s3";
import { config } from "../../config";

function validateAWSConfig(): {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_REGION: string;
} {
  const requiredEnvVars = {
    AWS_ACCESS_KEY_ID: config.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: config.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: config.S3_BUCKET_NAME,
    S3_REGION: config.S3_REGION,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `AWS configuration incomplete. Missing env vars: ${missingVars.join(", ")}`
    );
  }

  return {
    AWS_ACCESS_KEY_ID: requiredEnvVars.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: requiredEnvVars.AWS_SECRET_ACCESS_KEY!,
    S3_BUCKET_NAME: requiredEnvVars.S3_BUCKET_NAME!,
    S3_REGION: requiredEnvVars.S3_REGION!,
  };
}

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const aws = validateAWSConfig();

    s3Client = new S3Client({
      region: aws.S3_REGION,
      credentials: {
        accessKeyId: aws.AWS_ACCESS_KEY_ID,
        secretAccessKey: aws.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3Client;
}

export function getS3Config() {
  return validateAWSConfig();
}
