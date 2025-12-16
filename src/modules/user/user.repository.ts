import { db } from "../../db";
import { users } from "../../db/schema";
import { eq, ilike } from "drizzle-orm";
import type { CreateUserInput, EditUserInput } from "./user.validator";

export type PublicUser = {
  id: string;
  email: string;
  role: "admin" | "client";
  createdAt: Date;
};

class UserRepository {

  findByEmail(email: string) {
    return db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
  }

  async findById(id: string): Promise<PublicUser | null> {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

 
 create(data: CreateUserInput & { passwordHash: string }) {
    return db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    });
  }

  update(
    id: string,
    data: Partial<EditUserInput & { passwordHash?: string }>
  ) {
    return db.update(users).set(data).where(eq(users.id, id));
  }


  findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<PublicUser[]> {
    return db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        search ? ilike(users.email, `%${search}%`) : undefined
      )
      .limit(limit)
      .offset((page - 1) * limit);
  }
}

export const userRepository = new UserRepository();
