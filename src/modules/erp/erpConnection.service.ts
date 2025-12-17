import { eq } from "drizzle-orm";
import { db } from "../../db";
import { erpConnections } from "../../db/schema";
import { createERPNextClientFromEncrypted } from "../../common/lib/erpnextClient";

export const getERPClientForUser = async (userId: string) => {
  const [connection] = await db
    .select()
    .from(erpConnections)
    .where(eq(erpConnections.userId, userId))
    .limit(1);

  if (!connection) {
    throw new Error("ERP connection not found");
  }
  console.log("the data is ", connection.erpDomain, connection.encryptedApiKey, connection.encryptedApiSecret)

  return createERPNextClientFromEncrypted({
    erpDomain: connection.erpDomain,
    encryptedApiKey: connection.encryptedApiKey,
    encryptedApiSecret: connection.encryptedApiSecret,
  });
};
