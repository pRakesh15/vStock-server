import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { setAuthCookie } from "../../utils/cookie.util";

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = await userService.login(req.body);
        setAuthCookie(res, token);
        res.json({ message: "Login successful" });
    } catch (err) {
        next(err);
    }
};

export const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        await userService.createUser(req.body);
        res.status(201).json({ message: "User created" });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "User id is required" });
        }

        const user = await userService.getById(id);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const getMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await userService.getMyProfile(req.user!.userId);
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await userService.getAll(req.query as any);
        res.json(users);
    } catch (err) {
        next(err);
    }
};

export const updateMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await userService.updateMyProfile(req.user!.userId, req.body);
        res.json({ message: "Profile updated" });
    } catch (err) {
        next(err);
    }
};

export const updateUserByAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "User id is required" });
        }

        await userService.updateAnyProfile(id, req.body);
        res.json({ message: "User updated" });
    } catch (err) {
        next(err);
    }
};
