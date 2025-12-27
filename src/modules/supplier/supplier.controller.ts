import type { Request, Response, NextFunction } from "express";
import { supplierService } from "./supplier.service";
import {
  createSupplierSchema,
  editSupplierSchema,
  getSuppliersQuerySchema,
} from "./supplier.validators";
import { AppError } from "../../common/error/app-error";

export const createSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = createSupplierSchema.parse(req.body);
    await supplierService.create(req.user!.userId, data);
    res.status(201).json({ message: "Supplier created" });
  } catch (e) {
    next(e);
  }
};

export const editSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id)
      throw new AppError("Supplier ID missing", 400);

    const data = editSupplierSchema.parse(req.body);
    await supplierService.update(
      req.user!.userId,
      req.params.id,
      data
    );

    res.json({ message: "Supplier updated" });
  } catch (e) {
    next(e);
  }
};

export const deleteSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id)
      throw new AppError("Supplier ID missing", 400);

    await supplierService.delete(
      req.user!.userId,
      req.params.id
    );

    res.json({ message: "Supplier deleted" });
  } catch (e) {
    next(e);
  }
};

export const getSupplierById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if(! req.user!.userId || !req.params.id) throw new AppError("id is not there",405);
    const supplier = await supplierService.getById(
      req.user!.userId,
      req.params.id
    );
    res.json(supplier);
  } catch (e) {
    next(e);
  }
};

export const getSuppliers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = getSuppliersQuerySchema.parse(req.query);
    const result = await supplierService.list(
      req.user!.userId,
      query
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
};
