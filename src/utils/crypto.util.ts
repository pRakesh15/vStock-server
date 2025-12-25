import crypto, { createDecipheriv, createHash } from "crypto";
import { config } from "../config";



const GCM_ALGO = "aes-256-gcm";
const GCM_IV_LEN = 12;

const CBC_ALGO = "aes-256-cbc";
const CBC_IV_LEN = 16;


if (!config.ERP_SECRET_KEY) {
  throw new Error("ERP_SECRET_KEY is missing");
}
const GCM_KEY = Buffer.from(config.ERP_SECRET_KEY, "hex");
if (GCM_KEY.length !== 32) {
  throw new Error("ERP_SECRET_KEY must be exactly 32 bytes");
}

if (!config.ENCRYPTION_SECRET) {
  throw new Error("ENCRYPTION_SECRET is missing");
}
const CBC_KEY = createHash("sha256")
  .update(config.ENCRYPTION_SECRET)
  .digest();



type GCMEncryptedPayload = {
  iv: string;
  content: string;
  tag: string;
};



export function encrypt(text: string): string {
  if (!text) {
    throw new Error("encrypt() received empty text");
  }

  const iv = crypto.randomBytes(GCM_IV_LEN);
  const cipher = crypto.createCipheriv(GCM_ALGO, GCM_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const payload: GCMEncryptedPayload = {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
  };

  return JSON.stringify(payload);
}



export function decrypt(encrypted: string): string {
  if (!encrypted) {
    throw new Error("decrypt() received empty value");
  }

  if (encrypted.includes(":")) {
    return decryptCBC(encrypted);
  }

  if (encrypted.trim().startsWith("{")) {
    const parsed = JSON.parse(encrypted) as GCMEncryptedPayload;
    return decryptGCM(parsed);
  }

  throw new Error("Unknown encrypted format");
}



function decryptCBC(payload: string): string {
  const parts = payload.split(":");

  if (parts.length !== 2) {
    throw new Error("Invalid CBC payload format");
  }

  const ivB64 = parts[0]!;
  const encrypted = parts[1]!;

  const iv = Buffer.from(ivB64, "base64");
  if (iv.length !== CBC_IV_LEN) {
    throw new Error("Invalid CBC IV length");
  }

  const decipher = createDecipheriv(CBC_ALGO, CBC_KEY, iv);

  let decrypted: string = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}



function decryptGCM(payload: GCMEncryptedPayload): string {
  if (!payload.iv || !payload.content || !payload.tag) {
    throw new Error("Invalid GCM payload");
  }

  const decipher = crypto.createDecipheriv(
    GCM_ALGO,
    GCM_KEY,
    Buffer.from(payload.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
