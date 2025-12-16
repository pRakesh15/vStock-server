import bcrypt from "bcryptjs";
import { userRepository } from "./user.repository";
import { signAccessToken } from "../../utils/jwt.util";
import type {
  CreateUserInput,
  EditUserInput,
  GetUsersQuery,
  LoginInput,
} from "./user.validator";
import { db } from "../../db";
import { encrypt } from "../../utils/crypto.util";
import { erpConnections, users } from "../../db/schema";
import { AppError } from "../../common/error/app-error";

class UserService {
  async login(data: LoginInput) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw new Error("Invalid credentials");

    const token = signAccessToken({
      userId: user.id,
      role: user.role,
    });

    return { token };
  }

  async createUser(data: CreateUserInput) {
    const exists = await userRepository.findByEmail(data.email);
    if (exists) {
      console.log("user exist")
      throw new AppError("User already exists", 409);

    }
    return db.transaction(async (tx) => {

      const passwordHash = await bcrypt.hash(data.password, 12);

      const [newUser] = await tx
        .insert(users)
        .values({
          email: data.email,
          passwordHash,
          role: data.role,
        })
        .returning();

      if (!newUser?.id) {

        console.log("failed to create user")
        throw new AppError("User already exists", 409);

      }
      console.log("user create now move  to create the erp ")
      if (data.erpDomain && data.apiKey && data.apiSecret) {
        const encryptedApiKey = encrypt(data.apiKey);
        const encryptedApiSecret = encrypt(data.apiSecret);
        console.log("enter to the erp modul", encryptedApiKey, encryptedApiSecret)
        await tx.insert(erpConnections).values({
          userId: newUser.id,
          erpDomain: data.erpDomain,
          encryptedApiKey: encryptedApiKey.content,
          encryptedApiSecret: encryptedApiSecret.content,
        });
        console.log("erp created")
      }

      return {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };
    });
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async getMyProfile(userId: string) {
    return this.getById(userId);
  }

  async getAll(query: GetUsersQuery) {
    return userRepository.findAll(
      query.page,
      query.limit,
      query.search
    );
  }

  async updateMyProfile(userId: string, data: EditUserInput) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }
    await userRepository.update(userId, data);
  }

  async updateAnyProfile(userId: string, data: EditUserInput) {
    return this.updateMyProfile(userId, data);
  }
}

export const userService = new UserService();
