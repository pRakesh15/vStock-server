import { Router } from "express";
import {
    login,
    createUser,
    getUserById,
    getMyProfile,
    getAllUsers,
    updateMyProfile,
    updateUserByAdmin,
} from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";



const router = Router();


router.post("/login", login);
router.post(
    "/createUser",
    authenticate,
    requireRole("admin"),
    createUser
);
router.get(
    "/getAllUser",
    authenticate,
    requireRole("admin"),
    getAllUsers
);
router.get(
    "/:id",
    authenticate,
    requireRole("admin"),
    getUserById
);
router.patch(
    "/:id",
    authenticate,
    requireRole("admin"),
    updateUserByAdmin
);
router.get("/me/profile", authenticate, getMyProfile);
router.patch(
    "/me/profile",
    authenticate,
    updateMyProfile
);

export default router;
