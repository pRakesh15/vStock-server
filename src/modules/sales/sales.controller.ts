import type { Request, Response, NextFunction } from "express";
import { createSalesSchema } from "./sales.schema";
import { salesService } from "./sales.service";
import { AppError } from "../../common/error/app-error";

export const createSale = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = createSalesSchema.parse(req.body);

        await salesService.create(req.user!.userId, data);

        res.status(201).json({ message: "Sales entry created" });
    } catch (err) {
        next(err);
    }
};

export const getSales = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await salesService.getAll(req.user!.userId);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const getSaleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {
        const saleId = req.params.id;
        if (!saleId) throw new AppError("id not found", 404);
        const data = await salesService.getById(
            req.user!.userId,
            saleId
        );
        res.json(data);
    } catch (err) {
        next(err);
    }
};

