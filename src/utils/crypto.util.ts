import crypto from "crypto";
import { config } from "../config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; 



if (!config.ERP_SECRET_KEY) {
  throw new Error("ERP_SECRET_KEY is not set in environment variables");
}

let SECRET_KEY: Buffer;

try {
  SECRET_KEY = Buffer.from(config.ERP_SECRET_KEY, "hex");
} catch {
  throw new Error("ERP_SECRET_KEY must be a valid hex string");
}

if (SECRET_KEY.length !== 32) {
  throw new Error(
    `Invalid ERP_SECRET_KEY length: ${SECRET_KEY.length} bytes (expected 32 bytes for aes-256-gcm)`
  );
}

export function encrypt(text: string) {
  if (!text) {
    throw new Error("encrypt() called with empty text");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}


export function decrypt(encrypted: {
  iv: string;
  content: string;
  tag: string;
}) {
  if (!encrypted?.iv || !encrypted?.content || !encrypted?.tag) {
    throw new Error("decrypt() called with invalid encrypted payload");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
