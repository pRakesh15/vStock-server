import type { Request, Response } from "express";
import { userService } from "./user.service";
import { setAuthCookie } from "../../utils/cookie.util";

export const login = async (req: Request, res: Response) => {
    const { token } = await userService.login(req.body);
    setAuthCookie(res, token);
    res.json({ message: "Login successful" });
};

export const createUser = async (req: Request, res: Response) => {
    await userService.createUser(req.body);
    res.status(201).json({ message: "User created" });
};

export const getUserById = async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: "User id is required" });
    }
    const user = await userService.getById(id);
    res.json(user);
};

export const getMyProfile = async (req: Request, res: Response) => {
    const user = await userService.getMyProfile(req.user!.userId);
    res.json(user);
};

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await userService.getAll(req.query as any);
    res.json(users);
};

export const updateMyProfile = async (req: Request, res: Response) => {
    await userService.updateMyProfile(req.user!.userId, req.body);
    res.json({ message: "Profile updated" });
};

export const updateUserByAdmin = async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ message: "User id is required" });
    }
    await userService.updateAnyProfile(id, req.body);
    res.json({ message: "User updated" });
};
