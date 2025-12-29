import type { Request, Response, NextFunction } from "express";
import { createPurchaseSchema } from "./purchase.schema";
import { purchaseService } from "./purchase.service";
import { ZodError } from "zod";
import { AppError } from "../../common/error/app-error";

export const createPurchase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createPurchaseSchema.parse(req.body);

    await purchaseService.create(req.user!.userId, data);

    res.status(201).json({ message: "Purchase entry created" });
  } catch (err) {
    next(err);
  }
};

export const getPurchases = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await purchaseService.getAll(req.user!.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getPurchaseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if(!req.params.id) throw new AppError("id not found",401)
    const data = await purchaseService.getById(
      req.user!.userId,
      req.params.id
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};
