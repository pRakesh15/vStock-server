import type { Request, Response, NextFunction } from "express";
import { createPurchaseSchema } from "./purchase.schema";
import { purchaseService } from "./purchase.service";
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
        const purchaseId = req.params.id;
        if (!purchaseId) throw new AppError("id not found", 404);
        const data = await purchaseService.getById(
            req.user!.userId,
            purchaseId
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
};

