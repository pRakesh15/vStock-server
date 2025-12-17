import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../common/error/app-error";
import { getERPClientForUser } from "./erpConnection.service";

export const testERPConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const erpClient = await getERPClientForUser(userId);

    const result = await erpClient.testConnection();

    if (!result.success) {
      throw new AppError(
        result.error || "Failed to connect to ERPNext",
        400
      );
    }

    res.json({
      success: true,
      connectedUser: result.connected_user,
      message: "ERP connection successful",
    });
  } catch (err) {
    next(err);
  }
};
