import { Router } from "express";
import { generateImageUploadUrl } from "./imageUpload.controller";
import { asyncHandler } from "../../middleware/async-handler";
import { authenticate } from "../../middleware/auth.middleware";


const imageUploadrouter = Router();

imageUploadrouter.post(
    "/upload-url",
    authenticate,
    asyncHandler(generateImageUploadUrl)
);

export default imageUploadrouter;
