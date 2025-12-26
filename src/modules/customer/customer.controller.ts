import type { Request, Response, NextFunction } from "express";
import { customerService } from "./customer.service";
import {
    createCustomerSchema,
    editCustomerSchema,
} from "./customer.validators";
import { AppError } from "../../common/error/app-error";

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = createCustomerSchema.parse(req.body);
        await customerService.create(req.user!.userId, data);
        res.status(201).json({ message: "Customer created" });
    } catch (e) {
        next(e);
    }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = editCustomerSchema.parse(req.body);
        if (!req.params.id) throw new AppError("no id provide", 404)
        await customerService.update(req.user!.userId, req.params.id, data);
        res.json({ message: "Customer updated" });
    } catch (e) {
        next(e);
    }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) throw new AppError("no id provide", 404)
        await customerService.delete(req.user!.userId, req.params.id);
        res.json({ message: "Customer deleted" });
    } catch (e) {
        next(e);
    }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.params.id) throw new AppError("no id provide", 404)
        const data = await customerService.getById(req.user!.userId, req.params.id);
        res.json(data);
    } catch (e) {
        next(e);
    }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await customerService.list(req.user!.userId);
        res.json(data);
    } catch (e) {
        next(e);
    }
};
