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
import { asyncHandler } from "../../middleware/async-handler";



const router = Router();


router.post("/login", asyncHandler(login));

router.post(
  "/createUser",
  authenticate,
  requireRole("admin"),
  asyncHandler(createUser)
);

router.get(
  "/getAllUser",
  authenticate,
  requireRole("admin"),
  asyncHandler(getAllUsers)
);

router.get(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(getUserById)
);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(updateUserByAdmin)
);

router.get("/me/profile", authenticate, asyncHandler(getMyProfile));

router.patch(
  "/me/profile",
  authenticate,
  asyncHandler(updateMyProfile)
);

export default router;
