import type{ Request, Response, NextFunction } from "express";
import { imageUploadService } from "./imageUpload.service";
import { generateImageUploadSchema } from "./imageUpload.schema";

export const generateImageUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = generateImageUploadSchema.parse(req.body);

    const result = await imageUploadService.generateUploadUrl(
      req.user?.userId, 
      data
    );

    res.json({
      message: "Upload URL generated",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
