import bcrypt from "bcryptjs";
import { userRepository } from "./user.repository";
import { signAccessToken } from "../../utils/jwt.util";
import type {
  CreateUserInput,
  EditUserInput,
  GetUsersQuery,
  LoginInput,
} from "./user.validator";

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
    if (exists) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(data.password, 12);

    await userRepository.create({
      ...data,
      passwordHash,
    });
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error("User not found");
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
