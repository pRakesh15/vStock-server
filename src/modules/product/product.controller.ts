import type { Request, Response, NextFunction } from "express";
import { productService } from "./product.service";
import {
    createProductSchema,
    editProductSchema,
    getProductsQuerySchema,
} from "./product.validators";
import { AppError } from "../../common/error/app-error";

export const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = createProductSchema.parse(req.body);
        await productService.create(req.user!.userId, data);
        res.status(201).json({ message: "Product created" });
    } catch (err) {
        next(err);
    }
};

export const editProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = editProductSchema.parse(req.body);
        const productId = req.params.id;
        if (!productId) throw new AppError("product Id not found", 404);
        await productService.update(req.user!.userId, productId, data);
        res.json({ message: "Product updated" });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = req.params.id;
        if (!productId) throw new AppError("product Id not found", 404);
        await productService.delete(req.user!.userId, productId);
        res.json({ message: "Product deleted" });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = req.params.id;
        if (!productId) throw new AppError("product Id not found", 404);

        const product = await productService.getById(
            req.user!.userId,
            productId
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const query = getProductsQuerySchema.parse(req.query);
        const result = await productService.list(req.user!.userId, query);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getPublicProductByBarcode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const tenantId = req.params.tenantId;
        const barcode = req.params.barcode;
        if (!tenantId || !barcode) throw new AppError("product Id not found", 404);

        const product = await productService.getPublicByBarcode(
            tenantId,
            barcode
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};
